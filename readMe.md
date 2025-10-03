# QA Learning Hub 🎓

A comprehensive web-based quiz platform for Quality Assurance education with advanced admin management capabilities and progressive learning system.

## Overview 🎯

The QA Learning Hub is an interactive learning platform where users progress through various software testing domains while administrators can comprehensively track performance, manage users, and automate system operations. The platform features scenario-based quizzes across 25+ testing domains with three difficulty levels: **Beginner**, **Intermediate**, and **Advanced**.

---

## 👨‍💻 User Features

### 🔐 Authentication & User Management
- **Secure Login System**: JWT-based authentication with session management
- **Profile Management**: View personal progress, achievements, and change password
- **Password Security**: Update passwords anytime from profile settings
- **Automatic Session Handling**: Seamless login persistence

### 📚 Quiz Categories & Learning Domains

#### **Core QA Skills** (6 Quizzes)
- **Tester Mindset** - Develop critical thinking for testing
- **Communication** - Essential communication skills for QA professionals
- **Initiative** - Self-motivation and proactive testing approaches
- **Standard Script Testing** - Execute predefined test cases effectively
- **Fully Scripted Testing** - Comprehensive scripted testing methodologies
- **Exploratory Testing** - Ad-hoc and investigative testing techniques

#### **Technical Testing** (6 Quizzes)
- **Script Metrics & Troubleshooting** - Analyze and debug test scripts
- **Locale Testing** - International and localization testing
- **Build Verification** - Smoke testing and build validation
- **Test Types & Tricks** - Various testing methodologies and techniques
- **Test Support** - Support testing activities and processes
- **Sanity & Smoke Testing** - Quick validation testing strategies

#### **Project Management** (7 Quizzes)
- **Time Management** - Efficient time allocation and deadline management
- **Risk Analysis** - Identify and assess testing risks
- **Risk Management** - Mitigate and manage identified risks
- **Non-Functional Testing** - Performance, security, and usability testing
- **Issue Verification** - Validate and confirm reported issues
- **Issue Tracking Tools** - Master bug tracking systems
- **Raising Tickets** - Effective defect reporting and documentation

#### **Content Testing** (4 Quizzes)
- **CMS Testing** - Content Management System testing
- **Email Testing** - Email functionality and content validation
- **Content Copy Testing** - Review and validate written content
- **Reports Testing** - Test reporting functionality and accuracy

#### **Interview Preparation** (2 Quizzes)
- **Automation Interview** - Technical interview preparation for automation roles
- **Functional Interview** - Behavioral and functional testing interviews

### 🎮 Progressive Learning System
- **Three Difficulty Levels**: Progress from Beginner (5 questions) → Intermediate (5 questions) → Advanced (5 questions)
- **Scenario-Based Questions**: Real-world testing scenarios with multiple choice answers
- **Instant Feedback**: Immediate explanations for each answer choice
- **Progress Tracking**: Visual progress indicators and completion status
- **Performance Analytics**: Score tracking and improvement recommendations

### 🏆 Achievement System
- **Digital Badges**: Earn badges for completing quizzes with 80%+ scores
- **Badge Gallery**: View all earned achievements in dedicated badges section
- **Completion Certificates**: Recognition for mastering each testing domain
- **Progress Visualization**: Clear indicators of learning milestones

### 📊 Personal Dashboard
- **Progress Overview**: Visual representation of completed quizzes
- **Performance History**: Track scores and improvement over time
- **Recommended Learning Paths**: Suggested next quizzes based on performance
- **Study Guides**: Access to helpful resources and documentation

---

## 🛡️ Admin Features

### 👥 User Management
- **Complete User Overview**: View all registered users with detailed profiles
- **User Activity Monitoring**: Track last active dates and engagement levels
- **Account Creation**: Create new user accounts with customizable access
- **User Progress Analysis**: Detailed breakdown of individual user performance with real-time data
- **Account Deletion**: Remove user accounts with data cleanup
- **Smart View Modes**: Toggle between grid and row views for user lists
- **Advanced Filtering**: Search by username and sort by various criteria
- **Live Data Updates**: Progress data refreshes automatically when viewing user details
- **Intelligent Progress Sorting**: 
  - Categories sorted by completion (most completed first)
  - Quizzes sorted by status (Failed → Passed → In Progress → Not Started)
  - Easy identification of areas needing attention

### 📈 Analytics & Reporting
- **Dashboard Statistics**: 
  - Total registered users
  - Active users (last 7 days)
  - Quiz completion rates
  - Average completion percentages
  - User engagement metrics
- **User Performance Tracking**: Individual progress across all quiz domains
- **Score Analytics**: 
  - Detailed score breakdowns and performance trends
  - Real-time score calculation with question history
  - Accurate tracking of attempts and previous scores
  - Visual progress indicators with color-coded status
- **Question-Level Analysis**: 
  - Review individual question responses and patterns
  - Track correct/incorrect answers per quiz
  - Monitor improvement across multiple attempts

### 🏆 Badge Management
- **Badge Tracking**: Monitor all user achievements and certifications
- **Badge Analytics**: View badge distribution and completion rates
- **User Badge Profiles**: Detailed view of individual user achievements
- **Achievement Statistics**: Track overall badge earning patterns

### ⏰ Timer Management System
- **Global Timer Settings**: Set default time limits for all quizzes
- **Per-Quiz Customization**: Individual timer settings for specific quizzes
- **Flexible Time Limits**: Configure from 0 seconds (no limit) to 300 seconds per question
- **Bulk Timer Operations**: Manage multiple quiz timers simultaneously
- **Timer Statistics**: Monitor how time limits affect completion rates

### 🔄 Automated Reset System
- **Auto-Reset Configuration**: Automatically reset completed quizzes for users
- **Flexible Scheduling**: Set reset periods from minutes to months
- **Smart Reset Logic**: Only reset quizzes for users who have completed them
- **Real-Time Countdown**: Live countdown timers for next auto-reset
- **Manual Override**: Trigger immediate resets when needed
- **Reset History**: Track all automated and manual reset operations

### 📅 Scheduled Operations
- **Custom Reset Scheduling**: Schedule specific quiz resets for individual users
- **Bulk Reset Operations**: Reset multiple users' progress simultaneously
- **Date/Time Flexibility**: Schedule resets for any future date and time
- **Schedule Management**: View, modify, and cancel scheduled operations
- **Automated Execution**: System automatically processes scheduled resets

### 📝 Content Management
- **Quiz Scenarios Viewer**: Review all quiz questions and scenarios
- **Content Categorization**: Organize quizzes by skill areas and difficulty
- **Study Guide Management**: Upload and manage learning resources for each quiz
- **Guide Settings**: Configure access to external learning materials
- **URL Management**: Set up links to additional resources and documentation

### 📊 Data Export & Reporting
- **CSV Export Options**:
  - Complete user data export
  - Simplified user progress reports
  - Custom filtered exports
- **Flexible Export Filters**:
  - Select specific users
  - Choose particular quizzes
  - Filter by date ranges
  - Export by performance criteria
- **Progress Reports**: Generate comprehensive progress reports for management
- **Data Visualization**: Charts and graphs for user engagement and performance

### 🔧 System Administration
- **Real-Time Monitoring**: Live dashboard updates and system status
- **User Authentication Management**: Monitor login activities and sessions
- **System Health Checks**: Automated checks for scheduled operations
- **Database Management**: User data integrity and cleanup operations
- **Security Monitoring**: Track admin access and system modifications

---

## 🎨 UI/UX Enhancements

### Modern Interface Design
- **Responsive Layout**: Fully responsive design adapts to all screen sizes
- **Intuitive Navigation**: Clear menu structure with easy access to all features
- **Visual Feedback**: Real-time updates and status indicators
- **Accessibility**: ARIA labels and keyboard navigation support

### Admin Dashboard Improvements
- **Aligned Controls**: 
  - User Management title, view toggles, search, and sort filters perfectly aligned
  - Consistent spacing and visual hierarchy
  - Mobile-responsive layout that stacks gracefully on smaller screens
- **Smart Data Display**:
  - Grid and row view options for user lists
  - Color-coded progress indicators
  - Expandable detail panels with organized information
- **Performance Optimizations**:
  - Efficient data loading and caching
  - Fresh data fetching when viewing user details
  - Minimal re-renders for better responsiveness

### User Experience Features
- **Progress Visualization**:
  - Color-coded quiz cards (Not Started → In Progress → Completed)
  - Visual badges for achievements
  - Clear completion percentages
- **Seamless Navigation**:
  - Quick access to profile settings and password change
  - Easy quiz selection and continuation
  - Info page with comprehensive system guide
- **Error Handling**:
  - Graceful error messages
  - Automatic retry mechanisms
  - Clear feedback for all actions

---

## 🛠️ Technical Implementation

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Hosting**: 
  - Frontend: AWS S3 Static Website Hosting
  - Backend API: Render.com
  - Database: MongoDB Atlas

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for user passwords
- **Rate Limiting**: API request throttling for security
- **CORS Protection**: Cross-origin request security
- **XSS Prevention**: Input sanitization and output encoding
- **Environment Protection**: Secure environment variable handling
- **Session Management**: Secure session handling and token refresh

### API Architecture
- **RESTful Design**: Standard HTTP methods and status codes
- **Modular Structure**: Organized routes and middleware
- **Error Handling**: Comprehensive error management and logging
- **Data Validation**: Input validation and sanitization
- **Performance Optimization**: Efficient database queries and caching

---

## 🚀 Development Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Modern web browser
- Git for version control

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd qa-learning-hub
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

4. **Start Development Servers**
   ```bash
   # Backend server (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend server (Terminal 2)
   cd frontend
   npm run dev
   ```

5. **Access the Application**
   - Main Application: `http://localhost:8080`
   - Admin Dashboard: `http://localhost:8080/pages/admin2.html`

### Environment Variables
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=3000
```

---

## 📁 Project Structure

```
qa-learning-hub/
├── backend/
│   ├── config/
│   │   ├── config.js          # Application configuration
│   │   └── database.js        # MongoDB connection setup
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   ├── models/
│   │   ├── User.js            # User schema and model
│   │   ├── quizUser.model.js  # Quiz user data model
│   │   ├── setting.model.js   # System settings model
│   │   ├── autoReset.model.js # Auto-reset configuration model
│   │   └── scheduledReset.model.js # Scheduled operations model
│   ├── routes/
│   │   ├── admin.js           # Admin-specific routes
│   │   ├── api.js             # General API routes
│   │   └── users.js           # User management routes
│   ├── server.js              # Main server file
│   └── game.js                # Quiz game logic
├── frontend/
│   ├── pages/                 # HTML pages for different sections
│   │   ├── communication-quiz.html
│   │   ├── login.html
│   │   ├── admin2.html
│   │   └── your-new-quiz.html
│   ├── quizzes/
│   │   ├── communication-quiz.js
│   │   └── your-new-quiz.js
│   ├── scripts/
│   │   ├── badge-service.js
│   │   └── quiz-progress-service.js
│   ├── services/
│   │   └── quiz-progress-service.js
│   ├── styles/
│   │   └── styles.css
│   ├── assets/
│   │   └── badges/
│   ├── components/
│   │   └── quiz-component.js
│   ├── data/
│   │   ├── communication-scenarios.js
│   │   └── your-new-scenarios.js
│   ├── public/data/
│   │   └── communication-scenarios.js
│   ├── index.html
│   ├── login.html
│   ├── admin2.html
│   └── config.js
├── docs/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🔧 Adding New Quizzes

The platform is designed for easy extensibility. To add a new quiz, follow these practical steps:

### 1. Duplicate Existing Files
Choose an existing quiz similar to your new one and duplicate these three files:

**HTML File**: Copy from `frontend/pages/`
```bash
# Example: Copy an existing quiz HTML page
cp frontend/pages/communication-quiz.html frontend/pages/your-new-quiz.html
```

**JavaScript File**: Copy from `frontend/quizzes/`
```bash
# Example: Copy the corresponding JS file
cp frontend/quizzes/communication-quiz.js frontend/quizzes/your-new-quiz.js
```

**Data/Scenarios File**: Copy from `frontend/data/`
```bash
# Example: Copy the scenarios data file
cp frontend/data/communication-scenarios.js frontend/data/your-new-scenarios.js
```

### 2. Update Scenarios Data File
Edit your copied scenarios file (`frontend/data/your-new-scenarios.js`):

```javascript
export const yourNewScenarios = {
    basic: [
        {
            id: 1,
            level: 'Basic',
            title: 'Your Scenario Title',
            description: 'Your scenario question text...',
            options: [
                {
                    text: 'Option A text',
                    outcome: 'Explanation for this choice',
                    experience: 20  // Positive for correct, negative for incorrect
                },
                // ... add 3-4 options per scenario
            ]
        },
        // ... add 4 more basic scenarios
    ],
    intermediate: [
        // ... add 5 intermediate scenarios
    ],
    advanced: [
        // ... add 5 advanced scenarios  
    ]
};
```

### 3. Update JavaScript Quiz File
Edit your copied JS file (`frontend/quizzes/your-new-quiz.js`):

```javascript
// Update the import to your new scenarios file
import { yourNewScenarios } from '../data/your-new-scenarios.js';

// Update the class name
export class YourNewQuiz extends BaseQuiz {
    constructor() {
        // Update the quiz name property
        Object.defineProperty(this, 'quizName', {
            value: 'your-new-quiz',  // Must match your file names
            writable: false,
            configurable: false,
            enumerable: true
        });
        
        // Update scenario assignments
        this.basicScenarios = yourNewScenarios.basic;
        this.intermediateScenarios = yourNewScenarios.intermediate;
        this.advancedScenarios = yourNewScenarios.advanced;
    }
}
```

### 4. Update HTML Page
Edit your copied HTML file (`frontend/pages/your-new-quiz.html`):

```html
<head>
    <title>Your New Quiz Title - QA Learning Hub</title>
    <!-- Keep existing head content -->
</head>

<!-- Update the script import at the bottom -->
<script type="module">
    import { YourNewQuiz } from '../quizzes/your-new-quiz.js';
    const quiz = new YourNewQuiz();
    quiz.startGame();
</script>
```

### 5. Add Quiz Name to Multiple System Files

For your new quiz to properly integrate with all system components, you need to add it to several files:

#### A. Quiz Categories (Required)
Update `frontend/quiz-list.js` to include your new quiz:

```javascript
export const QUIZ_CATEGORIES = {
    'Your Appropriate Category': [
        // ... existing quizzes in this category
        'your-new-quiz'  // Add your quiz ID here
    ],
    // ... other categories
};
```

#### B. Badge Service Badge Mapping (Required for Badge Images)
Update `frontend/scripts/badge-service.js` badge image mapping:

```javascript
this.badgeImageMapping = {
    // ... existing mappings
    'your-new-quiz': 'your-new-quiz.svg',  // Add your quiz badge image mapping
    // ... rest of mappings
};
```

#### C. Quiz Progress Service Known Quiz Names (Required for Progress Tracking)
Update `frontend/services/QuizProgressService.js` KNOWN_QUIZ_NAMES array:

```javascript
const KNOWN_QUIZ_NAMES = [
    // ... existing quiz names
    'your-new-quiz',  // Add your quiz name here
    // ... rest of quiz names
];
```

#### D. Quiz Progress Service Normalization (Required for Consistent Naming)
Update the `knownQuizNames` array in the `normalizeQuizName` method in `frontend/services/QuizProgressService.js`:

```javascript
const knownQuizNames = [
    // ... existing quiz names
    'your-new-quiz',  // Add your quiz name here
    // ... rest of quiz names
];
```

#### E. Admin Dashboard Badge Mapping (Required for Admin Badge Display)
Update `frontend/admin2.js` badge image mapping in the `getBadgeImage` method:

```javascript
const badgeImageMapping = {
    // ... existing mappings
    'your-new-quiz': 'your-new-quiz.svg',  // Add your quiz badge image mapping
    // ... rest of mappings
};
```

#### F. Create Badge Image Asset (Required)
Create the corresponding SVG badge image file:
- Create: `frontend/assets/badges/your-new-quiz.svg`
- Or copy/modify an existing badge SVG to match your quiz theme

#### G. Add Quiz Description (Required for Quiz Listing)
Update `frontend/quiz-list.js` in the `getQuizDescription` method:

```javascript
getQuizDescription(quizName) {
    const descriptions = {
        // ... existing descriptions
        'your-new-quiz': 'Your descriptive text about what this quiz teaches',
        // ... rest of descriptions
    };
    return descriptions[quizName] || 'Master essential testing skills';
}
```

#### H. Enhanced Admin Display Name (Optional)
For better display in admin dashboard, update `frontend/admin2.js` in the `formatQuizName` method's `displayNames` object:

```javascript
const displayNames = {
    // ... existing display names
    'your-new-quiz': 'Your Enhanced Display Name for Admin',
    // ... rest of display names
};
```

### 6. Add Navigation Links
Update the main index page (`frontend/index.html`) - the quiz will automatically appear in the appropriate category section based on your `QUIZ_CATEGORIES` entry.

### 7. Admin Dashboard Integration
Your new quiz should automatically appear in:
- **Admin user progress tracking**
- **Badge system** (users earn badges for 80%+ completion)
- **Analytics and reporting**
- **Timer settings management**
- **Auto-reset functionality**

### 8. Testing Your New Quiz
1. Start your development server
2. Navigate to `http://localhost:8080/pages/your-new-quiz.html`
3. Test all scenarios and difficulty levels
4. Verify it appears in the main quiz list
5. Check admin dashboard shows the new quiz data

### File Naming Convention
Ensure consistent naming across all files:
- HTML: `your-new-quiz.html`
- JavaScript: `your-new-quiz.js` 
- Data: `your-new-scenarios.js`
- Quiz ID in categories: `'your-new-quiz'`
- Class name: `YourNewQuiz` (PascalCase)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

### Development Guidelines
- Follow ES6+ JavaScript standards
- Maintain consistent code formatting
- Include comprehensive comments
- Test all new features thoroughly
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📝 Recent Updates & Improvements

### Data Accuracy & Real-Time Updates (Latest)
- **Fresh Data Fetching**: Admin view details now always fetch latest user progress
- **Accurate Score Tracking**: Fixed score calculation to properly handle both API and stored data formats
- **Question History Integration**: Automatic fetching of detailed question history for completed quizzes
- **Data Normalization**: Consistent handling of quiz names and data structures across the system

### Enhanced Admin Features
- **Intelligent Sorting**: 
  - Progress summary categories sorted by completion count
  - Quizzes within categories ordered by status priority
  - Quick identification of struggling areas
- **UI Alignment**: 
  - Perfectly aligned user management controls
  - Consistent visual hierarchy
  - Responsive design for all screen sizes
- **Comprehensive User Details**:
  - Real-time progress data
  - Detailed score breakdowns
  - Question-level analytics
  - Badge achievement tracking

### User Experience Improvements
- **Profile Management**: 
  - Easy password changes from profile settings
  - Enhanced security features
  - Immediate password updates
- **Information Access**: 
  - Comprehensive info page with system guide
  - Clear explanations of all features
  - Visual examples and color coding
- **Progress Tracking**: 
  - Accurate quiz completion percentages
  - Visual progress indicators
  - Badge achievement notifications

### Technical Enhancements
- **Backend API Improvements**:
  - Complete user data fetching including attempts and previous scores
  - Data normalization for consistent formatting
  - Efficient query optimization
- **Frontend Performance**:
  - Smart caching with fresh data fetching when needed
  - Reduced API calls through intelligent data management
  - Improved error handling and logging
- **Data Integrity**:
  - Proper handling of different data formats
  - Consistent quiz name normalization
  - Accurate score calculations across all views

---

## 🆘 Support

For technical support or questions:
- Create an issue in the GitHub repository
- Review existing documentation in the `/docs` folder
- Check the troubleshooting section in the admin dashboard

---

**Built with ❤️ for the QA Community** 