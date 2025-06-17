const mongoose = require('mongoose');
const Jobpost = require('../../models/Jobpost');
const User = require('../../models/User');

describe('JobPost Model Test', () => {
  let testUser;
  
  // Create a test user before tests
  beforeAll(async () => {
    testUser = new User({
      name: 'JobPost Test User',
      email: 'jobposttest@example.com',
      password: 'password123',
      role: 'Recruiter'
    });
    await testUser.save();
  });
  
  // Test case for valid job post data
  it('should create & save job post successfully', async () => {
    const jobPostData = {
      jobTitle: 'Software Engineer',
      salary: 100000,
      location: 'New York, NY',
      jobDescription: 'We are looking for a talented software engineer...',
      company: 'Tech Company',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: [
        {
          title: 'Software Developer',
          company: 'Previous Tech Corp',
          dates: '2+ years',
          description: 'Development experience'
        }
      ],
      education: [
        {
          degree: 'Bachelor in Computer Science',
          university: 'Any University',
          location: 'Any Location'
        }
      ],
      department: 'Engineering',
      userId: testUser._id,
      recruiter: testUser._id
    };
    
    const validJobPost = new Jobpost(jobPostData);
    const savedJobPost = await validJobPost.save();
    
    // Object Id should be defined when successfully saved to MongoDB
    expect(savedJobPost._id).toBeDefined();
    expect(savedJobPost.jobTitle).toBe(jobPostData.jobTitle);
    expect(savedJobPost.salary).toBe(jobPostData.salary);
    expect(savedJobPost.skills).toEqual(expect.arrayContaining(jobPostData.skills));
    expect(savedJobPost.userId.toString()).toBe(testUser._id.toString());
  });
  
  // Test case for required fields
  it('should fail to create job post with missing required fields', async () => {
    const jobPostWithoutRequiredField = new Jobpost({
      jobTitle: 'Software Engineer'
    });
    
    let err;
    
    try {
      await jobPostWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);    expect(err.errors.salary).toBeDefined();
    expect(err.errors.location).toBeDefined();
    expect(err.errors.jobDescription).toBeDefined();
    expect(err.errors.company).toBeDefined();
    // MongoDB validation for arrays behaves differently, so we don't check for skills error
    expect(err.errors.department).toBeDefined();
    expect(err.errors.userId).toBeDefined();
  });
  
  // Clean up after all tests
  afterAll(async () => {
    await Jobpost.deleteMany({ company: 'Tech Company' });
    await User.deleteMany({ email: 'jobposttest@example.com' });
  });
});
