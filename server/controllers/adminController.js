const User = require('../models/User');
const Jobpost = require('../models/Jobpost');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const Interview = require('../models/Interview'); // Added Interview model
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

// Get all interviews for admin management
exports.getAllInterviews = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { 
      status, 
      candidate, 
      recruiter, 
      jobTitle, 
      company, 
      dateFrom, 
      dateTo,
      interviewType
    } = req.query;

    // Build query object
    const query = {};

    // Add filters if provided
    if (status) query.status = status;
    if (interviewType) query.interviewType = interviewType;

    // Date range filter
    if (dateFrom || dateTo) {
      query.scheduledDate = {};
      if (dateFrom) query.scheduledDate.$gte = new Date(dateFrom);
      if (dateTo) query.scheduledDate.$lte = new Date(dateTo);
    }

    // Find all interviews with filtering
    let interviews = await Interview.find(query)
      .populate('candidateId', 'name email')
      .populate('recruiterId', 'name email company')
      .populate({
        path: 'jobPostId',
        select: 'jobTitle company'
      })
      .populate({
        path: 'applicationId',
        select: 'status appliedAt'
      })
      .sort({ scheduledDate: -1 });

    // Additional filtering that requires populated fields
    if (interviews.length > 0) {
      if (candidate) {
        const candidateRegex = new RegExp(candidate, 'i');
        interviews = interviews.filter(
          interview => interview.candidateId && 
            (candidateRegex.test(interview.candidateId.name) || 
             candidateRegex.test(interview.candidateId.email))
        );
      }

      if (recruiter) {
        const recruiterRegex = new RegExp(recruiter, 'i');
        interviews = interviews.filter(
          interview => interview.recruiterId && 
            (recruiterRegex.test(interview.recruiterId.name) || 
             recruiterRegex.test(interview.recruiterId.email))
        );
      }

      if (jobTitle) {
        const jobTitleRegex = new RegExp(jobTitle, 'i');
        interviews = interviews.filter(
          interview => interview.jobPostId && 
            jobTitleRegex.test(interview.jobPostId.jobTitle)
        );
      }

      if (company) {
        const companyRegex = new RegExp(company, 'i');
        interviews = interviews.filter(
          interview => 
            (interview.jobPostId && companyRegex.test(interview.jobPostId.company)) ||
            (interview.recruiterId && interview.recruiterId.company && 
             companyRegex.test(interview.recruiterId.company))
        );
      }
    }

    res.json(interviews);
  } catch (error) {
    console.error('Error getting interviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific interview by ID
exports.getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidateId', 'name email')
      .populate('recruiterId', 'name email company')
      .populate({
        path: 'jobPostId',
        select: 'jobTitle company location'
      })
      .populate({
        path: 'applicationId',
        select: 'status appliedAt resumeId'
      });
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // If the application has a resume, populate that too
    if (interview.applicationId && interview.applicationId.resumeId) {
      await interview.applicationId.populate({
        path: 'resumeId',
        select: 'name email skills education workExperience'
      });
    }
    
    res.json(interview);
  } catch (error) {
    console.error('Error getting interview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an interview
exports.updateInterview = async (req, res) => {
  try {
    const { 
      interviewType, 
      scheduledDate, 
      duration, 
      location, 
      description, 
      attendees,
      videoConferenceLink,
      feedback,
      status
    } = req.body;

    // Find interview first to check if it exists
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Update interview fields
    const updateFields = {
      interviewType: interviewType || interview.interviewType,
      scheduledDate: scheduledDate || interview.scheduledDate,
      duration: duration || interview.duration,
      location: location || interview.location,
      description: description || interview.description,
      videoConferenceLink: videoConferenceLink || interview.videoConferenceLink
    };

    // Only update arrays if they are provided
    if (attendees) updateFields.attendees = attendees;
    if (feedback) updateFields.feedback = feedback;
    
    // Update status if provided
    if (status) {
      updateFields.status = status;
      
      // If status is updated, update the application status as well
      if (status !== interview.status) {
        const application = await Application.findById(interview.applicationId);
        if (application) {
          let appStatus = application.status;
          
          // Map interview status to application status
          if (status === 'Completed') appStatus = 'Interview Completed';
          else if (status === 'Cancelled') appStatus = 'Interview Cancelled';
          else if (status === 'No Show') appStatus = 'Interview No-Show';
          
          // Update application status
          application.status = appStatus;
          
          // Add to status history
          if (!application.statusHistory) {
            application.statusHistory = [];
          }
          
          application.statusHistory.push({
            status: appStatus,
            changedAt: new Date(),
            changedBy: req.user.id,
            notes: `Interview status updated to ${status}`
          });
          
          await application.save();
        }
      }
    }

    // Update the interview
    const updatedInterview = await Interview.findByIdAndUpdate(
      req.params.id, 
      updateFields,
      { new: true, runValidators: true }
    )
    .populate('candidateId', 'name email')
    .populate('recruiterId', 'name email')
    .populate({
      path: 'jobPostId',
      select: 'jobTitle company'
    })
    .populate({
      path: 'applicationId',
      select: 'status appliedAt'
    });

    res.json(updatedInterview);
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete an interview
exports.deleteInterview = async (req, res) => {
  try {
    const interviewId = req.params.id;

    // Find the interview first to get its application ID
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Delete the interview
    await Interview.findByIdAndDelete(interviewId);

    // Update the application status if necessary
    if (interview.applicationId) {
      const application = await Application.findById(interview.applicationId);
      if (application && application.status.includes('Interview')) {
        // Check if there are other interviews for this application
        const otherInterviews = await Interview.countDocuments({ 
          applicationId: interview.applicationId,
          _id: { $ne: interviewId }
        });

        // If no other interviews exist, update application status
        if (otherInterviews === 0) {
          application.status = 'Under Review';
          
          // Add to status history
          if (!application.statusHistory) {
            application.statusHistory = [];
          }
          
          application.statusHistory.push({
            status: 'Under Review',
            changedAt: new Date(),
            changedBy: req.user.id,
            notes: 'Interview cancelled by administrator'
          });
          
          await application.save();
        }
      }
    }

    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};