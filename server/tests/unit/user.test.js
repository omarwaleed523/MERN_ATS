const mongoose = require('mongoose');
const User = require('../../models/User');

describe('User Model Test', () => {
  // Test case for valid user data
  it('should create & save user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'Candidate'
    };
    
    const validUser = new User(userData);
    const savedUser = await validUser.save();
    
    // Object Id should be defined when successfully saved to MongoDB
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.password).toBe(userData.password);
    expect(savedUser.role).toBe(userData.role);
  });
  
  // Test case for required fields
  it('should fail to create user with missing required fields', async () => {
    const userWithoutRequiredField = new User({ name: 'Test User' });
    let err;
    
    try {
      await userWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
    expect(err.errors.role).toBeDefined();
  });
  
  // Test case for invalid role value
  it('should fail to create user with invalid role', async () => {
    const userWithInvalidRole = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'InvalidRole'
    });
    
    let err;
    
    try {
      await userWithInvalidRole.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.role).toBeDefined();
  });
  
  // Clean up after each test
  afterEach(async () => {
    await User.deleteMany({ email: 'test@example.com' });
  });
});
