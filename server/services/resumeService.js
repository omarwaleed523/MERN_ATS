const Resume = require('../models/Resume');

// Save parsed resume data to MongoDB
const saveResume = async (resumeData) => {
    try {
        const resume = new Resume(resumeData);
        await resume.save();
        return resume;
    } catch (error) {
        throw new Error(`Error saving resume: ${error.message}`);
    }
};

// Fetch all resumes from MongoDB
const getAllResumes = async () => {
    try {
        const resumes = await Resume.find({});
        return resumes;
    } catch (error) {
        throw new Error(`Error fetching resumes: ${error.message}`);
    }
};

// Fetch a single resume by ID
const getResumeById = async (resumeId) => {
    try {
        const resume = await Resume.findById(resumeId);
        return resume;
    } catch (error) {
        throw new Error(`Error fetching resume: ${error.message}`);
    }
};

// Update a resume by ID
const updateResume = async (resumeId, updateData) => {
    try {
        const updatedResume = await Resume.findByIdAndUpdate(resumeId, updateData, { new: true });
        return updatedResume;
    } catch (error) {
        throw new Error(`Error updating resume: ${error.message}`);
    }
};

module.exports = { saveResume, getAllResumes, getResumeById, updateResume };