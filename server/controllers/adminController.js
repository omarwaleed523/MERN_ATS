const User = require('../models/User');
const Jobpost = require('../models/Jobpost');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const mongoose = require('mongoose');

// Get system statistics for admin dashboard
exports.getSystemStats = async (req, res) => {
  try {
    // Count users by role
    const totalUsers = await User.countDocuments();
    const candidatesCount = await User.countDocuments({ role: 'Candidate' });
    const recruitersCount = await User.countDocuments({ role: 'Recruiter' });
    const adminCount = await User.countDocuments({ role: 'Administrator' });

    // Count job posts
    const jobPostsCount = await Jobpost.countDocuments();
    
    // Count applications
    const applicationsCount = await Application.countDocuments();
    
    // Count resumes (new)
    const resumesCount = await Resume.countDocuments();
    
    // Count applications by status
    const pendingApplications = await Application.countDocuments({ status: 'Pending' });
    const acceptedApplications = await Application.countDocuments({ status: 'Accepted' });
    const rejectedApplications = await Application.countDocuments({ status: 'Rejected' });

    res.json({
      totalUsers,
      candidatesCount,
      recruitersCount,
      adminCount,
      jobPostsCount,
      applicationsCount,
      resumesCount,
      pendingApplications,
      acceptedApplications,
      rejectedApplications
    });
  } catch (error) {
    console.error('Error getting system stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent users (last 10)
exports.getRecentUsers = async (req, res) => {
  try {
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json(recentUsers);
  } catch (error) {
    console.error('Error getting recent users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent job posts (last 10)
exports.getRecentJobs = async (req, res) => {
  try {
    const recentJobs = await Jobpost.find()
      .sort({ postDate: -1 })
      .limit(10);
    
    res.json(recentJobs);
  } catch (error) {
    console.error('Error getting recent job posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users for admin management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, phonenumber, company } = req.body;
    const userId = req.params.userId;

    // Find user first to check if it exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    const updateFields = {
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      phonenumber: phonenumber || user.phonenumber
    };

    // Add company field only if role is Recruiter
    if (role === 'Recruiter') {
      updateFields.company = company || user.company || '';
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Delete the user
    const result = await User.findByIdAndDelete(userId);
    
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    // In a production environment, you might want to:
    // 1. Delete or reassign user's job posts if they're a recruiter
    // 2. Delete or anonymize user's applications if they're a candidate
    // 3. Delete or anonymize user's resume if they're a candidate

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get database schemas
exports.getSchemas = async (req, res) => {
  try {
    const schemas = {
      User: extractSchemaFields(User.schema),
      Jobpost: extractSchemaFields(Jobpost.schema),
      Application: extractSchemaFields(Application.schema),
      Resume: extractSchemaFields(Resume.schema)
    };
    
    res.json(schemas);
  } catch (error) {
    console.error('Error getting schemas:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to extract fields from a mongoose schema
function extractSchemaFields(schema) {
  const fields = [];
  
  for (const [path, schemaType] of Object.entries(schema.paths)) {
    // Skip internal Mongoose fields
    if (path.startsWith('_') && path !== '_id') continue;
    
    const field = {
      path: path,
      instance: schemaType.instance,
      required: schemaType.isRequired || false
    };
    
    // Add enum values if they exist
    if (schemaType.enumValues && schemaType.enumValues.length) {
      field.enum = schemaType.enumValues;
    }
    
    // Add reference if it's a ref
    if (schemaType.options && schemaType.options.ref) {
      field.ref = schemaType.options.ref;
    }
    
    // Add unique property if set
    if (schemaType.options && schemaType.options.unique) {
      field.unique = true;
    }
    
    // Add default value if set
    if (schemaType.defaultValue !== undefined) {
      field.default = schemaType.defaultValue;
    }
    
    fields.push(field);
  }
  
  return fields;
}

// Get top skills across resumes
exports.getTopSkills = async (req, res) => {
  try {
    const Resume = require('../models/Resume');
    
    // Aggregate to extract and count skills across all resumes
    const topSkills = await Resume.aggregate([
      // Unwind the Skills array to create a document for each skill
      { $unwind: "$Skills" },
      // Group by skill and count occurrences
      { $group: { 
        _id: "$Skills", 
        count: { $sum: 1 } 
      }},
      // Sort by count in descending order
      { $sort: { count: -1 } },
      // Limit to top 10 skills
      { $limit: 10 },
      // Reshape for output
      { $project: {
        _id: 0,
        skill: "$_id",
        count: 1
      }}
    ]);
    
    res.json(topSkills);
  } catch (error) {
    console.error('Error getting top skills:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get company statistics
exports.getCompanyStats = async (req, res) => {
  try {
    const Jobpost = require('../models/Jobpost');
    const User = require('../models/User');
    
    // Get companies with job post counts
    const companiesWithJobCounts = await Jobpost.aggregate([
      { $group: { 
        _id: "$company", 
        jobCount: { $sum: 1 },
        // Calculate average salary offered
        avgSalary: { $avg: "$salary" }
      }},
      { $sort: { jobCount: -1 } },
      { $limit: 10 },
      { $project: {
        _id: 0,
        company: "$_id",
        jobCount: 1,
        avgSalary: 1
      }}
    ]);
    
    // Get recruiter counts per company
    const recruitersByCompany = await User.aggregate([
      { $match: { role: "Recruiter" } },
      { $group: { 
        _id: "$company", 
        recruiterCount: { $sum: 1 } 
      }},
      { $project: {
        _id: 0,
        company: "$_id",
        recruiterCount: 1
      }}
    ]);
    
    // Merge job counts with recruiter counts
    const companyStats = companiesWithJobCounts.map(company => {
      const recruiterData = recruitersByCompany.find(r => r.company === company.company) || { recruiterCount: 0 };
      return {
        ...company,
        recruiterCount: recruiterData.recruiterCount
      };
    });
    
    res.json(companyStats);
  } catch (error) {
    console.error('Error getting company stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get system activity timeline
exports.getActivityTimeline = async (req, res) => {
  try {
    const Application = require('../models/Application');
    const Jobpost = require('../models/Jobpost');
    const User = require('../models/User');
    
    // Get the last 6 months
    const months = [];
    const monthLabels = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() - i);
      const month = d.getMonth();
      const year = d.getFullYear();
      
      // Start of month
      const startDate = new Date(year, month, 1);
      // End of month
      const endDate = new Date(year, month + 1, 0);
      
      months.push({ startDate, endDate });
      monthLabels.push(startDate.toLocaleDateString('en-US', { month: 'short' }));
    }
    
    // Initialize data arrays
    const applicationCounts = [];
    const jobCounts = [];
    const userCounts = [];
    
    // Get counts for each month
    for (const { startDate, endDate } of months) {
      // Applications created in this month
      const applicationCount = await Application.countDocuments({
        appliedAt: { $gte: startDate, $lte: endDate }
      });
      applicationCounts.push(applicationCount);
      
      // Job posts created in this month
      const jobCount = await Jobpost.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });
      jobCounts.push(jobCount);
      
      // Users registered in this month
      const userCount = await User.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });
      userCounts.push(userCount);
    }
    
    res.json({
      labels: monthLabels,
      applications: applicationCounts,
      jobs: jobCounts,
      users: userCounts
    });
  } catch (error) {
    console.error('Error getting activity timeline:', error);
    res.status(500).json({ message: 'Server error' });
  }
};