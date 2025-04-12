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
    
    // Count applications by status
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const reviewingApplications = await Application.countDocuments({ status: 'reviewing' });
    const shortlistedApplications = await Application.countDocuments({ status: 'shortlisted' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });
    const hiredApplications = await Application.countDocuments({ status: 'hired' });

    res.json({
      totalUsers,
      candidatesCount,
      recruitersCount,
      adminCount,
      jobPostsCount,
      applicationsCount,
      pendingApplications,
      reviewingApplications,
      shortlistedApplications,
      rejectedApplications,
      hiredApplications
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