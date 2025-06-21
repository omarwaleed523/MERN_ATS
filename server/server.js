const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const cors = require('cors'); // Import cors
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();
console.log('Environment variables loaded');

const path = require('path');
const applicationRoutes = require('./routes/applicationroutes');
const jobPostRoutes = require('./routes/jobpostroutes');
const adminRoutes = require('./routes/adminRoutes');
const interviewRoutes = require('./routes/interviewRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// CORS configuration
const corsConfig = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  method: ["GET", "POST", "PUT", "DELETE"],
};

app.options("", cors(corsConfig));
app.use(cors(corsConfig));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/jobposts', jobPostRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/interviews', interviewRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));