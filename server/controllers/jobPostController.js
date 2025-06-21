const Jobpost = require('../models/Jobpost');
const { parseJobDescriptionFile } = require('./jobDescriptionParsingController');
const multer = require('multer');
const { uploadToCloudinary } = require('../config/cloudinary');

// Use memory storage for multer to handle uploads directly to Cloudinary
const storage = multer.memoryStorage();
const uploadFile = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Manual creation of a job post (if needed)
const createJobPost = async (req, res) => {
    const { jobTitle, salary, location, jobDescription, company, skills, experience, education, department, userId } = req.body;
    try {
        const jobPost = new Jobpost({
            jobTitle,
            salary,
            location,
            jobDescription,
            company,
            skills,
            experience,
            education,
            department,
            userId,
            recruiter: userId // Set the recruiter field to match userId
        });
        await jobPost.save();
        res.status(201).json({ message: 'Job post created successfully!', jobPost });
    } catch (error) {
        console.error('Error creating job post:', error);
        res.status(500).json({ message: 'Failed to create job post.' });
    }
};

// Get all job posts; if a userId query param is provided, filter by that recruiter
const getAllJobPosts = async (req, res) => {
    try {
        const { userId } = req.query;
        let jobPosts = [];
        if (userId) {
            jobPosts = await Jobpost.find({ userId }).populate('userId', 'name email company');
        } else {
            jobPosts = await Jobpost.find().populate('userId', 'name email company');
        }
        res.status(200).json(jobPosts);
    } catch (error) {
        console.error('Error retrieving job posts:', error);
        res.status(500).json({ message: 'Failed to retrieve job posts.' });
    }
};

const getJobPostById = async (req, res) => {
    const { jobPostId } = req.params;
    try {
        const jobPost = await Jobpost.findById(jobPostId).populate('userId', 'name email company');
        if (!jobPost) {
            return res.status(404).json({ message: 'Job post not found.' });
        }
        res.status(200).json(jobPost);
    } catch (error) {
        console.error('Error retrieving job post:', error);
        res.status(500).json({ message: 'Failed to retrieve job post.' });
    }
};

const updateJobPost = async (req, res) => {
    const { jobPostId } = req.params;
    const { jobTitle, salary, location, jobDescription, company, skills, experience, education, department, userId } = req.body;
    try {
        const jobPost = await Jobpost.findByIdAndUpdate(
            jobPostId,
            { 
                jobTitle, 
                salary, 
                location, 
                jobDescription, 
                company, 
                skills, 
                experience, 
                education, 
                department, 
                userId,
                recruiter: userId // Set the recruiter field to match userId
            },
            { new: true }
        );
        if (!jobPost) {
            return res.status(404).json({ message: 'Job post not found.' });
        }
        res.status(200).json({ message: 'Job post updated successfully!', jobPost });
    } catch (error) {
        console.error('Error updating job post:', error);
        res.status(500).json({ message: 'Failed to update job post.' });
    }
};

const deleteJobPost = async (req, res) => {
    const { jobPostId } = req.params;
    try {
        const jobPost = await Jobpost.findByIdAndDelete(jobPostId);
        if (!jobPost) {
            return res.status(404).json({ message: 'Job post not found.' });
        }
        res.status(200).json({ message: 'Job post deleted successfully.' });
    } catch (error) {
        console.error('Error deleting job post:', error);
        res.status(500).json({ message: 'Failed to delete job post.' });
    }
};

// New method: Upload a job post file, process JD data via JavaScript, then create a JobPost
const uploadJobPost = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        // Upload file to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, 'job_descriptions');
        const cloudinaryUrl = result.secure_url;
        
        // Determine file type based on mimetype or original filename
        const fileType = req.file.mimetype.includes('pdf') ? 'pdf' : 'docx';
        
        // Parse the job description from the buffer
        const parseResponse = await parseJobDescriptionFile(req.file.buffer, fileType);
        console.log('Parse response:', parseResponse);

        if (!parseResponse) {
            throw new Error('Failed to process job post file');
        }        const jobPost = new Jobpost({
            jobTitle: parseResponse.jobTitle,
            salary: parseResponse.salary,
            location: parseResponse.location,
            jobDescription: parseResponse.jobDescription,
            company: parseResponse.company,
            skills: parseResponse.skills,
            experience: parseResponse.experience || [],
            education: parseResponse.education || [],
            department: parseResponse.department,
            userId,
            recruiter: userId, // Set the recruiter field to match userId
            jobDescriptionUrl: cloudinaryUrl // Store the Cloudinary URL
        });

        await jobPost.save();
        res.status(201).json({
            message: 'Job post created successfully!',
            jobPost
        });
    } catch (error) {
        console.error('Error in uploadJobPost:', error);
        res.status(500).json({
            message: 'Failed to create job post',
            error: error.message
        });
    }
};

module.exports = {
    createJobPost,
    getAllJobPosts,
    getJobPostById,
    updateJobPost,
    deleteJobPost,
    uploadJobPost   // Export the new upload method
};