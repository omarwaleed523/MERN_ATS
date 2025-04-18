const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InterviewSchema = new Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobPostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jobpost',
        required: true
    },
    interviewType: {
        type: String,
        enum: ['Phone Screening', 'Technical', 'HR', 'Hiring Manager', 'Team', 'Final', 'Other'],
        required: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // Duration in minutes
        required: true
    },
    location: {
        type: String, // Can be physical location or virtual link
        required: true
    },
    description: {
        type: String
    },
    feedback: {
        rating: Number, // 1-5 scale
        strengths: String,
        weaknesses: String,
        notes: String,
        decision: {
            type: String,
            enum: ['Pending', 'Proceed', 'Reject', 'On Hold']
        }
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No-Show'],
        default: 'Scheduled'
    },
    attendees: [{
        type: String,
        trim: true
    }],
    videoConferenceLink: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the 'updatedAt' field before saving
InterviewSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Interview', InterviewSchema);