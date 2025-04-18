const Interview = require('../models/Interview');
const Application = require('../models/Application');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Create a new interview
exports.createInterview = async (req, res) => {
    try {
        const { applicationId, interviewType, scheduledDate, duration, location, description, attendees, videoConferenceLink } = req.body;

        // Verify the application exists
        const application = await Application.findById(applicationId).populate('jobPostId').populate('userId');
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Create new interview
        const interview = new Interview({
            applicationId,
            candidateId: application.userId._id,
            recruiterId: req.user.id, // From auth middleware
            jobPostId: application.jobPostId._id,
            interviewType,
            scheduledDate,
            duration,
            location,
            description,
            attendees: attendees || [],
            videoConferenceLink
        });

        await interview.save();

        // Update application status if it's not already in interview stage
        if (application.status !== 'Interview Scheduled') {
            application.status = 'Interview Scheduled';
            
            // Add to status history
            if (!application.statusHistory) {
                application.statusHistory = [];
            }
            
            application.statusHistory.push({
                status: 'Interview Scheduled',
                changedAt: new Date(),
                changedBy: req.user.id,
                notes: `Interview scheduled for ${new Date(scheduledDate).toLocaleString()}`
            });
            
            await application.save();
        }

        res.status(201).json(interview);
    } catch (error) {
        console.error('Error creating interview:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all interviews (with role-based filtering)
exports.getInterviews = async (req, res) => {
    try {
        let interviews;
        const { role } = req.user;
        
        // Different filtering based on user role
        if (role === 'Administrator') {
            // Admins can see all interviews
            interviews = await Interview.find()
                .populate('candidateId', 'name email')
                .populate('recruiterId', 'name email')
                .populate({
                    path: 'jobPostId',
                    select: 'jobTitle company'
                })
                .populate({
                    path: 'applicationId',
                    select: 'status appliedAt'
                })
                .sort({ scheduledDate: 1 });
        } else if (role === 'Recruiter') {
            // Recruiters can see interviews they created
            interviews = await Interview.find({ recruiterId: req.user.id })
                .populate('candidateId', 'name email')
                .populate('recruiterId', 'name email')
                .populate({
                    path: 'jobPostId',
                    select: 'jobTitle company'
                })
                .populate({
                    path: 'applicationId',
                    select: 'status appliedAt'
                })
                .sort({ scheduledDate: 1 });
        } else if (role === 'Candidate') {
            // Candidates can see interviews they're invited to
            interviews = await Interview.find({ candidateId: req.user.id })
                .populate('candidateId', 'name email')
                .populate('recruiterId', 'name email')
                .populate({
                    path: 'jobPostId',
                    select: 'jobTitle company'
                })
                .populate({
                    path: 'applicationId',
                    select: 'status appliedAt'
                })
                .sort({ scheduledDate: 1 });
        } else {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        res.json(interviews);
    } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get a specific interview by ID
exports.getInterviewById = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id)
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

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        // Security check - only allow access to relevant users
        if (req.user.role !== 'Administrator' && 
            req.user.id.toString() !== interview.recruiterId._id.toString() && 
            req.user.id.toString() !== interview.candidateId._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized access to this interview' });
        }

        res.json(interview);
    } catch (error) {
        console.error('Error fetching interview:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update an interview
exports.updateInterview = async (req, res) => {
    try {
        const { interviewType, scheduledDate, duration, location, description, attendees, videoConferenceLink, status, feedback } = req.body;
        
        const interview = await Interview.findById(req.params.id);
        
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        
        // Security check - only recruiters who scheduled the interview or admins can update it
        if (req.user.role !== 'Administrator' && req.user.id.toString() !== interview.recruiterId.toString()) {
            return res.status(403).json({ message: 'Unauthorized to update this interview' });
        }

        // Update fields
        if (interviewType) interview.interviewType = interviewType;
        if (scheduledDate) interview.scheduledDate = scheduledDate;
        if (duration) interview.duration = duration;
        if (location) interview.location = location;
        if (description) interview.description = description;
        if (attendees) interview.attendees = attendees;
        if (videoConferenceLink) interview.videoConferenceLink = videoConferenceLink;
        if (status) interview.status = status;
        
        // Handle feedback update
        if (feedback) {
            interview.feedback = {
                ...interview.feedback,
                ...feedback
            };
        }
        
        await interview.save();

        // If status changed to Completed, update the application status
        if (status === 'Completed') {
            const application = await Application.findById(interview.applicationId);
            if (application && application.status !== 'Interviewed') {
                application.status = 'Interviewed';
                
                // Add to status history
                if (!application.statusHistory) {
                    application.statusHistory = [];
                }
                
                application.statusHistory.push({
                    status: 'Interviewed',
                    changedAt: new Date(),
                    changedBy: req.user.id,
                    notes: feedback?.notes || 'Interview completed'
                });
                
                await application.save();
            }
        }

        res.json(interview);
    } catch (error) {
        console.error('Error updating interview:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete an interview
exports.deleteInterview = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);
        
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        
        // Security check - only recruiters who scheduled the interview or admins can delete it
        if (req.user.role !== 'Administrator' && req.user.id.toString() !== interview.recruiterId.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this interview' });
        }
        
        await Interview.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Interview deleted successfully' });
    } catch (error) {
        console.error('Error deleting interview:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get interviews by application id
exports.getInterviewsByApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        
        // Check if the application exists
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        
        // Security check - make sure user has access to this application
        if (req.user.role === 'Candidate' && application.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Unauthorized access to this application' });
        }
        
        // Get all interviews for this application
        const interviews = await Interview.find({ applicationId })
            .populate('candidateId', 'name email')
            .populate('recruiterId', 'name email')
            .populate({
                path: 'jobPostId',
                select: 'jobTitle company'
            })
            .sort({ scheduledDate: 1 });
            
        res.json(interviews);
    } catch (error) {
        console.error('Error fetching application interviews:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};