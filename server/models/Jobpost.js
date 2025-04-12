const mongoose = require('mongoose');

const JobPostSchema = new mongoose.Schema({
    jobTitle: { type: String, required: true },
    salary: { type: Number, required: true },
    location: { type: String, required: true },
    jobDescription: { type: String, required: true },
    company: { type: String, required: true },
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

module.exports = mongoose.model('Jobpost', JobPostSchema);