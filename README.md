# MERN ATS - Applicant Tracking System

A comprehensive, AI-powered Applicant Tracking System built with the MERN stack, featuring intelligent resume parsing, job matching, and automated recruitment workflows.

## 🚀 Features

### 🤖 AI-Powered Intelligence
- **Smart Resume Parsing**: Automatically extracts structured data from PDF/DOCX resumes using Google Gemini AI
- **Intelligent Job Matching**: AI-driven similarity scoring between candidates and job requirements
- **Automated Feedback**: Provides missing skills analysis and improvement suggestions

### 👥 Multi-Role Support
- **Candidates**: Apply to jobs, track application status, manage profiles
- **Recruiters**: Post jobs, review applications, schedule interviews, manage hiring pipeline
- **Administrators**: System oversight, user management, analytics dashboard

### 📧 Communication System
- **Email Notifications**: Automated status updates with retry mechanisms
- **Template System**: Professional email templates for all application stages
- **Real-time Updates**: Live status tracking with notification history

### 📅 Interview Management
- **Flexible Scheduling**: Support for virtual and in-person interviews
- **Multiple Interview Types**: Phone screening, technical, HR, panel interviews
- **Feedback System**: Structured interview feedback with ratings and decisions

## 🏗️ Technology Stack

### Frontend
- **React.js 19** - Modern UI framework
- **TailwindCSS + DaisyUI** - Utility-first styling with beautiful components
- **Framer Motion** - Smooth animations and transitions
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API communication
- **Chart.js** - Data visualization for analytics

### Backend
- **Node.js + Express.js** - Server framework
- **MongoDB + Mongoose** - Database and ODM
- **JWT** - Authentication and authorization
- **Nodemailer** - Email service with fallback support
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### AI & Document Processing
- **Google Gemini AI** - Resume parsing and job matching
- **Python Scripts** - Document processing (PDF/DOCX)
- **Custom AI Prompts** - Structured data extraction

## 📋 Prerequisites

Before running this application, make sure you have:
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local or cloud instance)
- **Google Gemini API Key**

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd MERN_ATS
```

### 2. Environment Setup

Create `.env` file in the server directory:
```env
# Database
MONGO_URI=mongodb://localhost:27017/mern_ats

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Google Gemini AI
REACT_APP_GEMINI_KEY=your_gemini_api_key

# Email Configuration (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM_NAME=ATS Recruitment Team

# Python Script Paths
PYTHON_SCRIPT_PATH_RESUME=../python-script/Resume_Parsing.py
PYTHON_SCRIPT_PATH_JD=../python-script/JD_Parsing.py

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the server
npm start
```

### 4. Frontend Setup
```bash
# Open new terminal and navigate to client directory
cd client

# Install dependencies
npm install

# Start the development server
npm start
```

### 5. Python Dependencies
```bash
# Install required Python packages
pip install PyPDF2 python-docx google-generativeai
```

## 🔧 Configuration

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGO_URI` in your `.env` file
3. The application will automatically create collections on first run

### Email Service Setup
- **Gmail**: Use app-specific passwords
- **Test Mode**: The system automatically falls back to Ethereal Email for testing
- **Production**: Configure your SMTP settings

### AI Configuration
1. Get Google Gemini API key from Google AI Studio
2. Add the key to your environment variables
3. The system handles rate limiting and error handling automatically

## 🚀 Usage

### For Candidates
1. **Sign up** with Candidate role
2. **Upload Resume** - AI will automatically parse and structure your data
3. **Browse Jobs** - View available positions with smart matching scores
4. **Apply** - Submit applications with parsed resume data
5. **Track Progress** - Monitor application status with email notifications

### For Recruiters
1. **Sign up** with Recruiter role
2. **Post Jobs** - Create detailed job descriptions with requirements
3. **Review Applications** - View AI-generated similarity scores and candidate profiles
4. **Schedule Interviews** - Manage interview process with automated notifications
5. **Make Decisions** - Update application status with bulk operations

### For Administrators
1. **System Dashboard** - View comprehensive analytics
2. **User Management** - Manage all system users
3. **Application Oversight** - Monitor all applications across the system
4. **Interview Management** - System-wide interview scheduling and tracking

## 📁 Project Structure

```
MERN_ATS/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Express backend
│   ├── controllers/       # Request handlers
│   ├── models/           # Database schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Helper functions
│   └── package.json
├── python-script/        # AI parsing scripts
│   ├── Resume_Parsing.py
│   └── JD_Parsing.py
└── README.md
```

## 🔐 Security Features

- **JWT-based Authentication** with role-based access control
- **Password Hashing** using bcryptjs
- **Input Validation** and sanitization
- **CORS Protection** with configurable origins
- **File Upload Security** with type validation
- **Rate Limiting** for API endpoints

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-token` - Token verification

### Application Endpoints
- `GET /api/applications/:userId` - Get user applications
- `POST /api/applications` - Submit new application
- `PUT /api/applications/:id/status` - Update application status
- `PUT /api/applications/bulk-status-update` - Bulk status updates

### Resume Endpoints
- `POST /api/resumes/upload` - Upload and parse resume
- `GET /api/resumes/user/:userId` - Get user resumes
- `PUT /api/resumes/:id` - Update resume data

### Job Post Endpoints
- `GET /api/jobposts` - Get all job posts
- `POST /api/jobposts` - Create new job post
- `PUT /api/jobposts/:id` - Update job post

### Interview Endpoints
- `GET /api/interviews` - Get interviews (role-based)
- `POST /api/interviews` - Schedule new interview
- `PUT /api/interviews/:id` - Update interview details

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 🚢 Deployment

### Frontend (React)
```bash
cd client
npm run build
# Deploy build folder to your hosting service
```

### Backend (Node.js)
```bash
cd server
# Set NODE_ENV=production in your environment
# Deploy to your Node.js hosting service
```

### Database
- Use MongoDB Atlas for production
- Ensure proper indexing for performance
- Set up backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include error logs and steps to reproduce

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with external job boards
- [ ] Video interview capabilities
- [ ] Advanced AI matching algorithms
- [ ] Multi-language support

## 👨‍💻 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Google Gemini AI for document processing capabilities
- MongoDB for flexible data storage
- React community for excellent documentation
- All contributors who helped improve this project
