const Interview = require('../models/Interview');
const Application = require('../models/Application');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendApplicationStatusEmail } = require('../utils/emailNotifications');

// Create a new interview
exports.createInterview = async (req, res) => {
    try {
        const { applicationId, interviewType, scheduledDate, duration, location, description, attendees, videoConferenceLink } = req.body;

        // Verify the application exists
        const application = await Application.findById(applicationId)
            .populate('jobPostId')
            .populate('userId');
            
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Create new interview object with proper handling of location/videoConferenceLink
        const interviewData = {
            applicationId,
            candidateId: application.userId._id,
            recruiterId: req.user.id, // From auth middleware
            jobPostId: application.jobPostId._id,
            interviewType,
            scheduledDate,
            duration,
            description,
            attendees: attendees || [],
        };

        // Set location based on what was provided
        if (videoConferenceLink) {
            interviewData.videoConferenceLink = videoConferenceLink;
            interviewData.location = 'Virtual Interview'; // Default location for virtual interviews
        } else if (location) {
            interviewData.location = location;
        } else {
            return res.status(400).json({ message: 'Either location or videoConferenceLink must be provided' });
        }

        const interview = new Interview(interviewData);
        await interview.save();

        // Get recruiter info for the email
        const recruiter = await User.findById(req.user.id).select('name email phonenumber company');

        // Update application status if it's not already in interview stage
        const previousStatus = application.status;
        
        if (application.status !== 'Interview Scheduled') {
            application.status = 'Interview Scheduled';
            
            // Add to status history
            if (!application.statusHistory) {
                application.statusHistory = [];
            }
            
            // Format interview details for inclusion in status notes and email
            const interviewDateFormatted = new Date(scheduledDate).toLocaleString();
            const locationInfo = videoConferenceLink ? 
                `Virtual interview via ${videoConferenceLink}` : 
                `Location: ${location}`;
            
            // Add interview details to nextSteps for email notification
            application.nextSteps = `
Interview Type: ${interviewType}
Date and Time: ${interviewDateFormatted}
Duration: ${duration} minutes
${locationInfo}
${description ? `Details: ${description}` : ''}
${attendees && attendees.length > 0 ? `Other Attendees: ${attendees.join(', ')}` : ''}
            `.trim();
            
            application.statusHistory.push({
                status: 'Interview Scheduled',
                changedAt: new Date(),
                changedBy: req.user.id,
                notes: `Interview scheduled for ${interviewDateFormatted}. ${locationInfo}`
            });
            
            await application.save();
            
            // Send email notification
            try {
                // Add recruiter information to the application object for the email
                application.jobPostId.recruiter = recruiter;
                
                // Send the email notification
                await sendApplicationStatusEmail(application, previousStatus);
                
                // Update the application to track that notification was sent
                if (!application.notificationsSent) {
                    application.notificationsSent = [];
                }
                
                application.notificationsSent.push({
                    status: 'Interview Scheduled',
                    sentAt: new Date(),
                    sentBy: req.user.id
                });
                
                await application.save();
            } catch (emailError) {
                console.error('Error sending interview notification email:', emailError);
                // Continue execution, don't fail if email fails
            }
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

        // Track if this is a reschedule (date/time change)
        const isRescheduled = scheduledDate && new Date(scheduledDate).getTime() !== new Date(interview.scheduledDate).getTime();

        // Update fields
        if (interviewType) interview.interviewType = interviewType;
        if (scheduledDate) interview.scheduledDate = scheduledDate;
        if (duration) interview.duration = duration;
        if (description) interview.description = description;
        if (attendees) interview.attendees = attendees;
        if (status) interview.status = status;
        
        // Handle location and videoConferenceLink properly
        if (videoConferenceLink) {
            interview.videoConferenceLink = videoConferenceLink;
            interview.location = 'Virtual Interview'; // Default location for virtual interviews
        } else if (location) {
            interview.location = location;
            interview.videoConferenceLink = ''; // Clear video link if physical location is provided
        }
        
        // Handle feedback update
        if (feedback) {
            interview.feedback = {
                ...interview.feedback,
                ...feedback
            };
        }
        
        await interview.save();

        // Get the associated application
        const application = await Application.findById(interview.applicationId)
            .populate('jobPostId')
            .populate('userId');

        if (application) {
            // Get recruiter info for the email
            const recruiter = await User.findById(req.user.id).select('name email phonenumber company');
            let previousStatus = application.status;
            let shouldSendEmail = false;

            // If status changed to Completed, update the application status
            if (status === 'Completed' && application.status !== 'Interviewed') {
                application.status = 'Interviewed';
                shouldSendEmail = true;
                
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
            }
            // If interview was rescheduled, update application with new details
            else if (isRescheduled) {
                // Set application status to Rescheduled if it's not already
                if (application.status !== 'Interview Rescheduled') {
                    previousStatus = application.status;
                    application.status = 'Interview Rescheduled';
                    shouldSendEmail = true;
                    
                    // Add to status history
                    if (!application.statusHistory) {
                        application.statusHistory = [];
                    }
                    
                    application.statusHistory.push({
                        status: 'Interview Rescheduled',
                        changedAt: new Date(),
                        changedBy: req.user.id,
                        notes: `Interview rescheduled to ${new Date(scheduledDate).toLocaleString()}`
                    });
                }
                
                // Format interview details for inclusion in status notes and email
                const interviewDateFormatted = new Date(scheduledDate).toLocaleString();
                const locationInfo = interview.videoConferenceLink ? 
                    `Virtual interview via ${interview.videoConferenceLink}` : 
                    `Location: ${interview.location}`;
                
                // Update nextSteps with new interview details
                application.nextSteps = `
Interview Type: ${interview.interviewType}
Date and Time: ${interviewDateFormatted}
Duration: ${interview.duration} minutes
${locationInfo}
${interview.description ? `Details: ${interview.description}` : ''}
${interview.attendees && interview.attendees.length > 0 ? `Other Attendees: ${interview.attendees.join(', ')}` : ''}
                `.trim();
                
                shouldSendEmail = true;
            }
            
            // Save application changes
            if (shouldSendEmail || previousStatus !== application.status) {
                await application.save();
                
                // Send email notification
                try {
                    // Add recruiter information to the application object for the email
                    application.jobPostId.recruiter = recruiter;
                    
                    // Send the email notification
                    await sendApplicationStatusEmail(application, previousStatus);
                    
                    // Update the application to track that notification was sent
                    if (!application.notificationsSent) {
                        application.notificationsSent = [];
                    }
                    
                    application.notificationsSent.push({
                        status: application.status,
                        sentAt: new Date(),
                        sentBy: req.user.id
                    });
                    
                    await application.save();
                } catch (emailError) {
                    console.error('Error sending interview update notification email:', emailError);
                    // Continue execution, don't fail if email fails
                }
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
        
        // Check if there's an associated application to update
        const application = await Application.findById(interview.applicationId)
            .populate('jobPostId')
            .populate('userId');
            
        if (application) {
            // Get recruiter info for the email
            const recruiter = await User.findById(req.user.id).select('name email phonenumber company');
            const previousStatus = application.status;
            
            // Check if there are other interviews for this application
            const otherInterviews = await Interview.countDocuments({ 
                applicationId: interview.applicationId,
                _id: { $ne: interview._id }
            });
            
            // If no other interviews and the application is in interview stage, update status
            if (otherInterviews === 0 && 
                (application.status === 'Interview Scheduled' || 
                 application.status === 'Interview Rescheduled')) {
                
                application.status = 'Interview Cancelled';
                
                // Add to status history
                if (!application.statusHistory) {
                    application.statusHistory = [];
                }
                
                application.statusHistory.push({
                    status: 'Interview Cancelled',
                    changedAt: new Date(),
                    changedBy: req.user.id,
                    notes: `Interview cancelled by ${req.user.role === 'Administrator' ? 'administrator' : 'recruiter'}`
                });
                
                // Add note about the canceled interview
                application.nextSteps = `
The scheduled interview has been cancelled. 
${interview.interviewType} interview that was scheduled for ${new Date(interview.scheduledDate).toLocaleString()} has been cancelled.

You will be notified if a new interview is scheduled.
                `.trim();
                
                await application.save();
                
                // Send email notification about cancelled interview
                try {
                    // Add recruiter information to the application object for the email
                    application.jobPostId.recruiter = recruiter;
                    
                    // Send the email notification
                    await sendApplicationStatusEmail(application, previousStatus);
                    
                    // Update the application to track that notification was sent
                    if (!application.notificationsSent) {
                        application.notificationsSent = [];
                    }
                    
                    application.notificationsSent.push({
                        status: 'Interview Cancelled',
                        sentAt: new Date(),
                        sentBy: req.user.id
                    });
                    
                    await application.save();
                } catch (emailError) {
                    console.error('Error sending interview cancellation notification email:', emailError);
                    // Continue execution, don't fail if email fails
                }
            }
        }
        
        // Delete the interview
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