const { saveResume, getAllResumes, getResumeById: fetchResumeById, updateResume: updateResumeService } = require('../services/resumeService');
const { parseResumeFile } = require('./resumeParsingController');
const multer = require('multer');
const fs = require('fs');
const Resume = require('../models/Resume');
const User = require('../models/User');

// Multer setup for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Function to upload and parse a resume
const uploadResume = async (req, res) => {
    try {
        const { userId } = req.body; // Ensure userId is sent in the request body
        const filePath = req.file.path; // Get the path of the uploaded file

        console.log(`File Path: ${filePath}`); // Debugging log        // Call the JavaScript parsing function to parse the resume
        const parseResponse = await parseResumeFile(filePath);
        console.log('Parse Response:', parseResponse); // Debugging log

        if (parseResponse) {            // Add the user ID to the parsed resume data
            const resumeData = {
                user: userId,
                ...parseResponse,
                ResumeText: parseResponse.ResumeText || "No resume text extracted"
            };

            // Save the parsed resume data to the database
            const savedResume = await saveResume(resumeData);
            console.log('Saved Resume:', savedResume); // Debugging log

            // Delete the uploaded file after processing
            fs.unlink(filePath, (err) => {
                if (err) console.error(`Error deleting file: ${err}`);
                else console.log(`File deleted: ${filePath}`);
            });

            res.status(201).json(savedResume);        } else {
            console.error('Failed to generate response from parsing function'); // Debugging log
            res.status(500).json({ error: 'Failed to parse resume' });
        }
    } catch (error) {
        console.error('Error in uploadResume:', error); // Debugging log
        res.status(500).json({ error: error.message });
    }
};

// Function to fetch all resumes
const fetchAllResumes = async (req, res) => {
    try {
        const resumes = await getAllResumes();
        res.status(200).json(resumes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function to retrieve resumes for a specific user
const getResumesByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const resumes = await Resume.find({ user: userId }).populate('user', 'name email');
        return res.status(200).json(resumes);
    } catch (error) {
        console.error('Error retrieving resumes:', error);
        return res.status(500).json({ message: 'Error retrieving resumes' });
    }
};

// Function to fetch a single resume by ID
const getResumeByIdController = async (req, res) => {
    const { resumeId } = req.params;
    try {
        const resume = await fetchResumeById(resumeId);
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.status(200).json(resume);
    } catch (error) {
        console.error('Error retrieving resume:', error);
        res.status(500).json({ message: 'Error retrieving resume' });
    }
};

// Function to update a resume
const updateResumeController = async (req, res) => {
    const { resumeId } = req.params;
    const updateData = req.body;
    try {
        const updatedResume = await updateResumeService(resumeId, updateData);
        res.status(200).json(updatedResume);
    } catch (error) {
        console.error('Error updating resume:', error);
        res.status(500).json({ message: 'Error updating resume' });
    }
};

// Function to delete a resume by ID
const deleteResumeById = async (req, res) => {
    const { resumeId } = req.params;

    try {
        const deletedResume = await Resume.findByIdAndDelete(resumeId);
        if (!deletedResume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({ message: 'Error deleting resume' });
    }
};

module.exports = { uploadResume, upload, fetchAllResumes, getResumesByUserId, getResumeById: getResumeByIdController, updateResume: updateResumeController, deleteResumeById };