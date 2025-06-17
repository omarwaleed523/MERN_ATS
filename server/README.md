# MERN ATS - Backend API

The Node.js/Express.js backend API for the MERN ATS (Applicant Tracking System), providing secure, scalable REST endpoints with AI integration and comprehensive business logic.

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** with secure token handling
- **Role-based Access Control** (Candidate, Recruiter, Administrator)
- **Password Hashing** with bcryptjs
- **Token Refresh** and validation middleware

### 🤖 AI Integration
- **Google Gemini AI** for resume parsing and job matching
- **Smart Similarity Scoring** between candidates and job requirements
- **Automated Feedback Generation** with missing skills analysis
- **Python Script Integration** for document processing

### 📧 Communication System
- **Email Notifications** with Nodemailer
- **Template System** for different application statuses
- **Retry Mechanism** for failed email delivery
- **Queue System** for background email processing

### 📊 Data Management
- **MongoDB Integration** with Mongoose ODM
- **Complex Relationships** between users, jobs, applications, and interviews
- **Status Tracking** with comprehensive audit trails
- **Bulk Operations** for efficient data processing

## 🛠️ Technology Stack

### Core Framework
- **Node.js** - JavaScript runtime
- **Express.js 4.21.2** - Web application framework
- **Mongoose 8.9.5** - MongoDB object modeling

### Security & Authentication
- **jsonwebtoken 9.0.2** - JWT implementation
- **bcryptjs 2.4.3** - Password hashing
- **helmet 8.1.0** - Security headers
- **cors 2.8.5** - Cross-origin resource sharing
- **express-rate-limit 7.5.0** - Rate limiting

### AI & External Services
- **@google/generative-ai 0.24.0** - Google Gemini AI integration
- **nodemailer 6.10.1** - Email service
- **multer 1.4.5-lts.1** - File upload handling
- **redis 4.7.0** - Caching and session storage

### Development Tools
- **dotenv 16.4.7** - Environment variable management
- **nodemon 3.1.9** - Development server with auto-restart

## 📁 Project Structure

```
server/
├── config/
│   └── db.js              # MongoDB connection configuration
├── controllers/           # Request handlers and business logic
│   ├── authController.js  # Authentication logic
│   ├── applicationcontroller.js # Application management
│   ├── resumeController.js # Resume parsing and management
│   ├── jobPostController.js # Job posting operations
│   ├── interviewController.js # Interview scheduling
│   └── adminController.js # Administrative functions
├── middleware/           # Custom middleware functions
│   ├── auth.js          # JWT authentication middleware
│   ├── isAdmin.js       # Admin authorization
│   └── upload.js        # File upload configuration
├── models/              # Database schemas
│   ├── User.js          # User model
│   ├── Resume.js        # Resume data model
│   ├── Jobpost.js       # Job posting model
│   ├── Application.js   # Application tracking model
│   └── Interview.js     # Interview management model
├── routes/              # API route definitions
│   ├── authRoutes.js    # Authentication endpoints
│   ├── resumeRoutes.js  # Resume operations
│   ├── jobpostroutes.js # Job posting endpoints
│   ├── applicationroutes.js # Application management
│   ├── interviewRoutes.js # Interview scheduling
│   └── adminRoutes.js   # Administrative endpoints
├── services/            # Business logic services
│   └── resumeService.js # Resume processing service
├── utils/               # Utility functions
│   ├── emailNotifications.js # Email service with templates
│   ├── pythonRunnerResume.js # Resume parsing integration
│   └── pythonRunnerJD.js # Job description parsing
├── uploads/             # File upload directory
├── server.js            # Application entry point
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **Python** (v3.8 or higher) with required packages
- **Google Gemini API Key**

### Installation

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create `.env` file in the server root:
   ```env
   # Database Configuration
   MONGO_URI=mongodb://localhost:27017/mern_ats
   
   # JWT Configuration
   JWT_SECRET=your_secure_jwt_secret_key_here
   
   # Google Gemini AI
   REACT_APP_GEMINI_KEY=your_gemini_api_key
   
   # Email Configuration (Optional - falls back to test mode)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_specific_password
   EMAIL_FROM_NAME=ATS Recruitment Team
   
   # Python Script Paths
   PYTHON_SCRIPT_PATH_RESUME=../python-script/Resume_Parsing.py
   PYTHON_SCRIPT_PATH_JD=../python-script/JD_Parsing.py
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Redis Configuration (Optional)
   REDIS_URL=redis://localhost:6379
   ```

4. **Install Python dependencies**:
   ```bash
   pip install PyPDF2 python-docx google-generativeai
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

## 📋 Available Scripts

### `npm start`
Starts the server with nodemon for development (auto-restart on changes).

### `npm run prod`
Starts the server in production mode.

### `npm test`
Runs the test suite (when tests are implemented).

## 🔗 API Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /register          # User registration
POST   /login             # User login
GET    /verify-token      # Token validation
POST   /refresh-token     # Token refresh
PUT    /update-profile    # Update user profile
```

### Resume Routes (`/api/resumes`)
```
POST   /upload            # Upload and parse resume
GET    /                  # Get all resumes (admin)
GET    /user/:userId      # Get user's resumes
GET    /:resumeId         # Get specific resume
PUT    /:resumeId         # Update resume
DELETE /:resumeId         # Delete resume
```

### Job Post Routes (`/api/jobposts`)
```
GET    /                  # Get all job posts
POST   /                  # Create new job post
GET    /:id               # Get specific job post
PUT    /:id               # Update job post
DELETE /:id               # Delete job post
GET    /user/:userId      # Get recruiter's job posts
```

### Application Routes (`/api/applications`)
```
GET    /                  # Get all applications (admin)
POST   /                  # Submit job application
GET    /:userId           # Get user's applications
PUT    /:id/status        # Update application status
PUT    /bulk-status-update # Bulk status updates
DELETE /:id               # Delete application
GET    /:id/history       # Get status history
```

### Interview Routes (`/api/interviews`)
```
GET    /                  # Get interviews (role-based)
POST   /                  # Schedule new interview
GET    /:id               # Get specific interview
PUT    /:id               # Update interview
DELETE /:id               # Cancel interview
GET    /application/:id   # Get interviews for application
```

### Admin Routes (`/api/admin`)
```
GET    /stats             # System statistics
GET    /users             # All users management
PUT    /users/:id         # Update user
DELETE /users/:id         # Delete user
GET    /schemas           # Database schemas
GET    /applications      # All applications
GET    /interviews        # All interviews
```

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phonenumber: Number,
  role: Enum['Candidate', 'Recruiter', 'Administrator'],
  profilepicture: String,
  company: String
}
```

### Resume Model
```javascript
{
  user: ObjectId (ref: User),
  Name: String,
  Email: String,
  Phone: String,
  Skills: [String],
  Experience: [{
    Title: String,
    Company: String,
    Dates: String,
    description: String
  }],
  Education: [{
    Degree: String,
    University: String,
    Location: String
  }],
  Department: String,
  ResumeText: String
}
```

### Application Model
```javascript
{
  userId: ObjectId (ref: User),
  resumeId: ObjectId (ref: Resume),
  jobPostId: ObjectId (ref: Jobpost),
  status: Enum[...statuses],
  statusHistory: [{
    status: String,
    changedAt: Date,
    changedBy: ObjectId,
    notes: String,
    emailSent: Boolean
  }],
  similarityScore: Number,
  missingSkills: String,
  improvementSuggestions: String,
  appliedAt: Date
}
```

## 🔐 Authentication & Security

### JWT Implementation
```javascript
// Generate token
const token = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Verify token middleware
const auth = async (req, res, next) => {
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

### Role-Based Access Control
```javascript
// Admin-only middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'Administrator') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Usage in routes
app.get('/api/admin/users', auth, isAdmin, getAllUsers);
```

## 🤖 AI Integration

### Resume Parsing Flow
1. **File Upload**: Multer handles PDF/DOCX uploads
2. **Python Processing**: Node.js spawns Python script
3. **AI Parsing**: Google Gemini extracts structured data
4. **Data Storage**: Parsed data saved to MongoDB
5. **Response**: Structured resume data returned

### Job Matching Algorithm
```javascript
const generateSimilarityScore = async (jobDesc, resume, jobPostData) => {
  const prompt = `
    Compare this job description with the candidate's resume.
    Job: ${jobDesc}
    Resume: ${resume}
    
    Provide:
    1. Similarity score (0-100)
    2. Missing skills
    3. Improvement suggestions
  `;
  
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};
```

## 📧 Email System

### Email Templates
```javascript
const emailTemplates = {
  'Submitted': {
    subject: 'Application Received - Thank You!',
    text: (data) => `
      Dear ${data.candidateName},
      Your application for ${data.jobTitle} has been received...
    `
  },
  'Interview Scheduled': {
    subject: 'Interview Scheduled',
    text: (data) => `
      Dear ${data.candidateName},
      Your interview has been scheduled for...
    `
  }
  // ... more templates
};
```

### Retry Mechanism
```javascript
const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
};
```

## 🔧 Configuration

### Database Connection
```javascript
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
```

### CORS Setup
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));
```

## 🧪 Testing

### Unit Tests Example
```javascript
describe('Auth Controller', () => {
  test('should register new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'Candidate'
    };
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);
      
    expect(response.body.user.email).toBe(userData.email);
  });
});
```

## 🚀 Deployment

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/atsdb
JWT_SECRET=your_production_secret
```

### Process Management
```bash
# Using PM2 for production
npm install -g pm2
pm2 start server.js --name "ats-api"
pm2 startup
pm2 save
```

### Docker Deployment
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

## 📊 Monitoring & Logging

### Error Handling
```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  
  res.status(500).json({ message: 'Server Error' });
};
```

### Request Logging
```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

## 🔍 Debugging

### Common Issues
1. **MongoDB Connection**: Check connection string and network access
2. **JWT Errors**: Verify secret key and token format
3. **Python Script Issues**: Check Python path and dependencies
4. **Email Failures**: Verify SMTP credentials and settings
5. **File Upload Problems**: Check multer configuration and permissions

### Debugging Tools
```javascript
// Debug specific routes
app.use('/api/debug', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    mongoConnected: mongoose.connection.readyState === 1,
    uploadsDir: path.join(__dirname, 'uploads'),
    pythonPath: process.env.PYTHON_SCRIPT_PATH_RESUME
  });
});
```

## 🚦 Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

## 🤝 Contributing

1. Follow RESTful API conventions
2. Implement proper error handling
3. Add input validation for all endpoints
4. Write comprehensive tests
5. Document new endpoints
6. Follow the existing code style

## 📞 Support

For backend-specific issues:
- Check server logs for detailed error messages
- Verify environment variables are set correctly
- Ensure database connection is established
- Test API endpoints with tools like Postman
- Check Python script execution and dependencies
