const JobPost = require('../models/Jobpost');

// Create a new job post
const createJobPost = async (req, res) => {
    const { title, description, userId } = req.body; // Get userId from request body

    try {
        const jobPost = new JobPost({ title, description, userId }); // Save userId with job post
        await jobPost.save();
        res.status(201).json({ message: 'Job post created successfully!', jobPost });
    } catch (error) {
        console.error('Error creating job post:', error);
        res.status(500).json({ message: 'Failed to create job post.' });
    }
};

// Get all job posts
const getAllJobPosts = async (req, res) => {
    try {
        const jobPosts = await JobPost.find(); // No authentication needed
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
    const { title, description, userId } = req.body; // Get userId from request body

    try {
        const jobPost = await JobPost.findByIdAndUpdate(jobPostId, { title, description, userId }, { new: true });
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

module.exports = { createJobPost, getAllJobPosts, getJobPostById, updateJobPost, deleteJobPost };