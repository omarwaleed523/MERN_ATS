const JobPost = require('../models/JobPost');
const { runPythonScript } = require('../utils/pythonRunnerJD');
const fs = require('fs');
const multer = require('multer');

// Multer storage for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const uploadFile = multer({ storage: storage });

// Manual creation of a job post (if needed)
const createJobPost = async (req, res) => {
    const { jobTitle, skills, experience, education, department, userId } = req.body;
    try {
        const jobPost = new JobPost({
            jobTitle,
            skills,
            experience,
            education,
            department,
            userId
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
            jobPosts = await JobPost.find({ userId });
        } else {
            jobPosts = await JobPost.find();
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
        const jobPost = await JobPost.findById(jobPostId);
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
    const { jobTitle, skills, experience, education, department, userId } = req.body;
    try {
        const jobPost = await JobPost.findByIdAndUpdate(
            jobPostId,
            { jobTitle, skills, experience, education, department, userId },
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
        const jobPost = await JobPost.findByIdAndDelete(jobPostId);
        if (!jobPost) {
            return res.status(404).json({ message: 'Job post not found.' });
        }
        res.status(200).json({ message: 'Job post deleted successfully.' });
    } catch (error) {
        console.error('Error deleting job post:', error);
        res.status(500).json({ message: 'Failed to delete job post.' });
    }
};

// New method: Upload a job post file, process JD data via Python, then create a JobPost
const uploadJobPost = async (req, res) => {
    const { userId } = req.body;  // Recruiter's ID from frontend
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    const filePath = req.file.path;
    try {
        const pythonResponse = await runPythonScript(filePath);
        if (pythonResponse) {
            const jobTitle = pythonResponse.JobTitle || "Untitled Job Post";
            const skills = (pythonResponse.Skills && Array.isArray(pythonResponse.Skills)) ? pythonResponse.Skills : [];
            const experience = (pythonResponse.Experience && Array.isArray(pythonResponse.Experience))
                ? pythonResponse.Experience.map(expObj => ({
                    title: expObj.Title,
                    company: expObj.Company,
                    dates: expObj.Dates,
                    description: expObj.description
                }))
                : [];
            const education = (pythonResponse.Education && Array.isArray(pythonResponse.Education))
                ? pythonResponse.Education.map(eduObj => ({
                    degree: eduObj.Degree,
                    university: eduObj.University,
                    location: eduObj.Location
                }))
                : [];
            const department = pythonResponse.Department || "";

            const jobPost = new JobPost({
                jobTitle,
                skills,
                experience,
                education,
                department,
                userId
            });
            await jobPost.save();
            res.status(201).json({ message: 'Job post created successfully!', jobPost });
        } else {
            res.status(500).json({ message: 'Failed to process job post file' });
        }
    } catch (error) {
        console.error('Error uploading job post:', error);
        res.status(500).json({ message: 'Failed to create job post.' });
    } finally {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });
    }
};

module.exports = {
    createJobPost,
    getAllJobPosts,
    getJobPostById,
    updateJobPost,
    deleteJobPost,
    uploadJobPost,   // Export the new upload method
    uploadFile       // Export the multer instance for routes
};