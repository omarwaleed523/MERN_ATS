const mongoose = require('mongoose');

const JobPostSchema = new mongoose.Schema({
    jobTitle: { type: String, required: true },
    skills: { type: [String], required: true },
    experience: [{
        title: String,
        company: String,
        dates: String,
        description: String
    }],
    education: [{
        degree: String,
        university: String,
        location: String
    }],
    department: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobPost', JobPostSchema);