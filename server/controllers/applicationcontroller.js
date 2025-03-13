const Application = require('../models/Application');
const JobPost = require('../models/JobPost');
const Resume = require('../models/Resume');

const applyForJob = async (req, res) => {
    const { resumeId, jobPostId, userId } = req.body;

    try {
        // Fetch the job post to get the job description
        const jobPost = await JobPost.findById(jobPostId);
        if (!jobPost) {
            return res.status(404).json({ message: 'Job post not found.' });
        }

        // Fetch the resume to get the resume text
        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found.' });
        }

        // Create the application with the job description and resume text
        const application = new Application({
            userId,
            resumeId,
            jobPostId,
            jobDescriptionText: jobPost.jobDescription,
            resumeText: resume.ResumeText
        });

        await application.save();
        res.status(201).json({ message: 'Application submitted successfully!', application });
    } catch (error) {
        console.error('Error applying for job:', error);
        res.status(500).json({ message: 'Failed to apply for job.' });
    }
};

// Function to get applications for a specific user
const getUserApplications = async (req, res) => {
    try {
        // Get userId from params instead of req.user
        const userId = req.params.userId;

        // Use the userId from params to find applications
        const applications = await Application.find({ userId })
            .populate('jobPostId')
            .populate('resumeId');

        res.status(200).json(applications);
    } catch (error) {
        console.error('Error retrieving applications:', error);
        res.status(500).json({ message: 'Failed to retrieve applications.' });
    }
};

const getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('jobPostId')
            .populate('resumeId')
            .populate('userId', 'name email'); // Include user details if needed

        res.status(200).json(applications);
    } catch (error) {
        console.error('Error retrieving applications:', error);
        res.status(500).json({ message: 'Failed to retrieve applications.' });
    }
}

// Function to delete an application
const deleteApplication = async (req, res) => {
    const applicationId = req.params.applicationId;

    try {
        const application = await Application.findOneAndDelete({ _id: applicationId });
        if (!application) {
            return res.status(404).json({ message: 'Application not found or you do not have permission to delete it.' });
        }
        res.status(200).json({ message: 'Application deleted successfully.' });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ message: 'Failed to delete application.' });
    }
};

module.exports = { applyForJob, getUserApplications, deleteApplication, getAllApplications };