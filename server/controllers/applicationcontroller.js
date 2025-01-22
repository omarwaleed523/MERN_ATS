const Application = require('../models/Application');

const applyForJob = async (req, res) => {
    const { resumeId, jobPostId, userId } = req.body;

    try {
        const application = new Application({ userId, resumeId, jobPostId });
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
        const applications = await Application.find({ userId: req.user._id }).populate('jobPostId');
        res.status(200).json(applications);
    } catch (error) {
        console.error('Error retrieving applications:', error);
        res.status(500).json({ message: 'Failed to retrieve applications.' });
    }
};

// Function to delete an application
const deleteApplication = async (req, res) => {
    const { applicationId } = req.params;
    const userId = req.user.id; // Assuming you have user authentication

    try {
        const application = await Application.findOneAndDelete({ _id: applicationId, userId });
        if (!application) {
            return res.status(404).json({ message: 'Application not found or you do not have permission to delete it.' });
        }
        res.status(200).json({ message: 'Application deleted successfully.' });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ message: 'Failed to delete application.' });
    }
};

module.exports = { applyForJob, getUserApplications, deleteApplication };