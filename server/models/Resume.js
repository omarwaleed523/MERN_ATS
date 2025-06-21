const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
    Title: String,       // Match the JavaScript parsing response
    Company: String,     // Match the JavaScript parsing response
    Dates: String,       // Match the JavaScript parsing response
    description: String  // Match the JavaScript parsing response
});

const EducationSchema = new mongoose.Schema({
    Degree: String,      // Match the JavaScript parsing response
    University: String,  // Match the JavaScript parsing response
    Location: String     // Match the JavaScript parsing response
});

const ResumeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to User
    Name: String,
    Email: String,
    Phone: String,    Skills: [String],
    Experience: [ExperienceSchema], // Array of embedded documents
    Education: [EducationSchema],   // Array of embedded documents
    Department: String,
    ResumeText: String,
    resumeUrl: String  // Cloudinary URL for the resume file
});

module.exports = mongoose.model('Resume', ResumeSchema);