const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Jobpost = require('../../models/Jobpost');
const jobPostRoutes = require('../../routes/jobpostroutes');
const mockAuth = require('../mocks/authMiddleware');

describe('JobPost API Integration Tests', () => {
  let app;
  let testUser;
  let token;
  
  // Set up express app for testing
  beforeAll(async () => {
    app = express();
    app.use(express.json());
    
    // Create test user
    testUser = new User({
      name: 'JobPost API Test User',
      email: 'jobpostapi@example.com',
      password: 'password123',
      role: 'Recruiter'
    });
    await testUser.save();
    
    // Create JWT token for authentication
    token = jwt.sign(
      { userId: testUser._id, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Use the mock auth middleware
    app.use('/api/jobposts', (req, res, next) => {
      req.user = { id: testUser._id };
      next();
    }, jobPostRoutes);
  });
    // Test creating a job post
  describe('POST /api/jobposts', () => {
    it('should create a new job post', async () => {
      const jobPostData = {
        jobTitle: 'Test Engineer',
        salary: 90000,
        location: 'Remote',
        jobDescription: 'Testing job description',
        company: 'Test Company',
        skills: ['Testing', 'Automation', 'QA'],
        department: 'Quality Assurance',
        userId: testUser._id.toString(), // Make sure userId is explicitly set and as a string
      };
      
      const response = await request(app)
        .post('/api/jobposts')
        .set('x-auth-token', token)
        .send(jobPostData)
        .expect('Content-Type', /json/);
        expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('jobPost');
      expect(response.body.jobPost.jobTitle).toBe(jobPostData.jobTitle);
      expect(response.body.jobPost.company).toBe(jobPostData.company);
      expect(response.body.jobPost.userId.toString()).toBe(testUser._id.toString());
        // Save job post ID for later tests
      jobPostId = response.body.jobPost._id;
    });
  });
  
  // Test getting all job posts
  describe('GET /api/jobposts', () => {
    it('should get all job posts', async () => {
      // First, create a test job post to ensure we have data
      const jobPostData = {
        jobTitle: 'Test Engineer for GET',
        salary: 90000,
        location: 'Remote',
        jobDescription: 'Testing job description for GET test',
        company: 'Test Company',
        skills: ['Testing', 'Automation', 'QA'],
        department: 'Quality Assurance',
        userId: testUser._id,
      };
      
      await request(app)
        .post('/api/jobposts')
        .set('x-auth-token', token)
        .send(jobPostData);
        
      // Now get all job posts
      const response = await request(app)
        .get('/api/jobposts')
        .set('x-auth-token', token)
        .expect('Content-Type', /json/);
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
  
  // Clean up after all tests
  afterAll(async () => {
    await Jobpost.deleteMany({ company: 'Test Company' });
    await User.deleteMany({ email: 'jobpostapi@example.com' });
  });
});
