const { saveResume, getAllResumes, getResumeById: fetchResumeById, updateResume: updateResumeService } = require('../services/resumeService');
const { parseResumeFile } = require('./resumeParsingController');
const fs = require('fs');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { uploadToCloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

// Function to upload and parse a resume
const uploadResume = async (req, res) => {
    try {
        const { userId } = req.body; // Ensure userId is sent in the request body
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }        // Upload file to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, 'resumes');
        const cloudinaryUrl = result.secure_url;
        
        // Determine file type based on mimetype or original filename
        const fileType = req.file.mimetype.includes('pdf') ? 'pdf' : 
                        (req.file.mimetype.includes('document') || req.file.originalname.endsWith('.docx')) ? 'docx' : null;
                        
        if (!fileType) {
            return res.status(400).json({
                success: false,
                message: 'Unsupported file type. Only PDF and DOCX files are allowed.'
            });
        }
          
        // Call the JavaScript parsing function to parse the resume
        const parseResponse = await parseResumeFile(req.file.buffer, fileType);
        console.log('Parse Response:', parseResponse); // Debugging log
        
        if (parseResponse) {
            // Add the user ID and file URL to the parsed resume data
            const resumeData = {
                user: userId,
                ...parseResponse,
                ResumeText: parseResponse.ResumeText || "No resume text extracted",
                resumeUrl: cloudinaryUrl // Store the Cloudinary URL
            };

            // Save the parsed resume data to the database
            const savedResume = await saveResume(resumeData);
            console.log('Saved Resume:', savedResume); // Debugging log

            // Return success response with the saved resume data
            return res.status(201).json({
                success: true,
                message: 'Resume uploaded and parsed successfully',
                data: savedResume
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Failed to parse resume'
            });
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
        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ 
                success: false,
                message: 'Resume not found' 
            });
        }
        
        // Delete from database
        await Resume.findByIdAndDelete(resumeId);
        
        // Note: We don't need to delete from Cloudinary unless we want to save storage
        // If needed, extract the public_id from the URL and use cloudinary.uploader.destroy(public_id)
        
        res.status(200).json({ 
            success: true,
            message: 'Resume deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting resume',
            error: error.message
        });
    }
};

module.exports = { 
    uploadResume, 
    fetchAllResumes, 
    getResumesByUserId, 
    getResumeById: getResumeByIdController, 
    updateResume: updateResumeController, 
    deleteResumeById 
};