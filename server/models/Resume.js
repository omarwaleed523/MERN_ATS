const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
    Title: String,       // Match the Python Response
    Company: String,     // Match the Python Response
    Dates: String,       // Match the Python Response
    description: String  // Match the Python Response
});

const EducationSchema = new mongoose.Schema({
    Degree: String,      // Match the Python Response
    University: String,  // Match the Python Response
    Location: String     // Match the Python Response
});

const ResumeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to User
    Name: String,
    Email: String,
    Phone: String,
    Skills: [String],
    Experience: [ExperienceSchema], // Array of embedded documents
    Education: [EducationSchema],   // Array of embedded documents
    Department: String
});

module.exports = mongoose.model('Resume', ResumeSchema);