const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../../models/User');
const authRoutes = require('../../routes/authRoutes');

describe('Auth API Integration Tests', () => {
  let app;
  
  // Set up express app for testing
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  // Before each test, clear any existing test users
  beforeEach(async () => {
    await User.deleteMany({ email: 'integrationtest@example.com' });
  });
  
  // Test registration endpoint
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Integration Test User',
        email: 'integrationtest@example.com',
        password: 'password123',
        role: 'Candidate'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/);      // Check if the response contains a token and user data
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('name', userData.name);
      expect(response.body.data).toHaveProperty('email', userData.email);
      expect(response.body.data).toHaveProperty('role', userData.role);
      
      // Verify user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(userData.name);
      
      // Password should be hashed
      const isMatch = await bcrypt.compare(userData.password, user.password);
      expect(isMatch).toBe(true);
    });
      it('should not register a user with existing email', async () => {
      // First create a user
      const userData = {
        name: 'Duplicate User',
        email: 'integrationtest@example.com', // Duplicate email
        password: 'password123',
        role: 'Candidate'
      };
      
      // Register the user first
      await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      // Try to register again with the same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
        
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already exists');
    });
  });
  
  // Test login endpoint
  describe('POST /api/auth/login', () => {    it('should log in an existing user', async () => {
      // First create a user to log in
      const userData = {
        name: 'Login Test User',
        email: 'logintest@example.com',
        password: 'password123',
        role: 'Candidate'
      };
      
      // Register the user first
      await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      // Now try to log in
      const loginData = {
        email: 'logintest@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect('Content-Type', /json/);expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('email', loginData.email);
    });
    
    it('should not log in with invalid credentials', async () => {
      const loginData = {
        email: 'integrationtest@example.com',
        password: 'wrongpassword'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
        expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid credentials');
    });
  });
  
  // Clean up after all tests
  afterAll(async () => {
    await User.deleteMany({ email: 'integrationtest@example.com' });
  });
});
