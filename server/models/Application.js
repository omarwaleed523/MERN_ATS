const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    jobPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jobpost', required: true },
    status: { 
        type: String, 
        enum: [
            'Draft',              // Application started but not submitted
            'Submitted',          // Application received
            'Under Review',       // Being screened by HR/recruiter
            'Shortlisted',        // Passed initial screening
            'Interview Scheduled',// Interview arranged
            'Interviewed',        // Interview completed
            'Assessment',         // Technical/skills assessment stage
            'Reference Check',    // Checking candidate references
            'Offer Extended',     // Job offer sent to candidate
            'Offer Accepted',     // Candidate accepted the offer
            'Offer Declined',     // Candidate declined the offer
            'Hired',              // Candidate joined
            'Rejected',           // Not selected at any stage
            'Withdrawn'           // Candidate withdrew application
        ], 
        default: 'Submitted' 
    },
    statusHistory: [{ 
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: String,
        emailSent: { type: Boolean, default: false }
    }],
    notificationsSent: [{
        status: String,
        sentAt: { type: Date, default: Date.now },
        successful: Boolean
    }],
    rejectionReason: { type: String },
    interviewNotes: { type: String },
    assessmentResults: { type: String },
    similarityScore: { type: Number, default: 0 },
    similarity: { type: Number, default: 0 },  // Legacy field maintained for backward compatibility
    missingSkills: { type: String, default: '' },
    improvementSuggestions: { type: String, default: '' },
    appliedAt: { type: Date, default: Date.now },
    jobDescriptionText: { type: String }, // Field to store job description text
    resumeText: { type: String }, // Field to store resume text
    currentStageStartDate: { type: Date, default: Date.now }, // When current stage began
    nextSteps: { type: String } // Upcoming actions in the hiring process
});

// Remove the automatic pre-save middleware that adds duplicate entries
// The status history will now be managed exclusively in the controller

module.exports = mongoose.model('Application', ApplicationSchema);