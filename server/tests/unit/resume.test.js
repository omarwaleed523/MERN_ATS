const mongoose = require('mongoose');
const Resume = require('../../models/Resume');
const User = require('../../models/User');

describe('Resume Model Test', () => {
  let testUser;
  
  // Create a test user before tests
  beforeAll(async () => {
    testUser = new User({
      name: 'Resume Test User',
      email: 'resumetest@example.com',
      password: 'password123',
      role: 'Candidate'
    });
    await testUser.save();
  });
  
  // Test case for valid resume data
  it('should create & save resume successfully', async () => {
    const resumeData = {
      user: testUser._id,
      Name: 'John Doe',
      Email: 'john@example.com',
      Phone: '1234567890',
      Skills: ['JavaScript', 'React', 'Node.js'],
      Experience: [
        {
          Title: 'Software Developer',
          Company: 'Tech Corp',
          Dates: '2020-2022',
          description: 'Developed web applications'
        }
      ],
      Education: [
        {
          Degree: 'Bachelor of Science',
          University: 'Tech University',
          Location: 'New York'
        }
      ],
      Department: 'INFORMATION-TECHNOLOGY',
      ResumeText: 'Full resume text goes here'
    };
    
    const validResume = new Resume(resumeData);
    const savedResume = await validResume.save();
    
    // Object Id should be defined when successfully saved to MongoDB
    expect(savedResume._id).toBeDefined();
    expect(savedResume.Name).toBe(resumeData.Name);
    expect(savedResume.Email).toBe(resumeData.Email);
    expect(savedResume.Skills).toEqual(expect.arrayContaining(resumeData.Skills));
    expect(savedResume.Experience[0].Title).toBe(resumeData.Experience[0].Title);
    expect(savedResume.Education[0].Degree).toBe(resumeData.Education[0].Degree);
    expect(savedResume.Department).toBe(resumeData.Department);
  });
  
  // Test case for required fields
  it('should fail to create resume without user reference', async () => {
    const resumeWithoutUser = new Resume({
      Name: 'John Doe',
      Email: 'john@example.com',
      Skills: ['JavaScript']
    });
    
    let err;
    
    try {
      await resumeWithoutUser.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.user).toBeDefined();
  });
  
  // Clean up after all tests
  afterAll(async () => {
    await Resume.deleteMany({ Email: 'john@example.com' });
    await User.deleteMany({ email: 'resumetest@example.com' });
  });
});
