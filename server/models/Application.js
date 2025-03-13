const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    jobPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPost', required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    similarity: { type: Number, default: 0 },
    appliedAt: { type: Date, default: Date.now },
    jobDescriptionText: { type: String }, // New field to store job description text
    resumeText: { type: String } // New field to store resume text
});

module.exports = mongoose.model('Application', ApplicationSchema);