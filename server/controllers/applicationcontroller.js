const Application = require('../models/Application');
const Jobpost = require('../models/Jobpost');
const Resume = require('../models/Resume');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const generateSimilarityScore = async (jobDesc, resume) => {
    try {
        const instruction = `
      You are an AI recruiter. Compare the job description and resume.
      Rate similarity between 0 (not relevant) to 100 (perfect fit).
      
      Job Description:
      ${jobDesc}

      Resume:
      ${resume}

      Return format: "Score: XX"
    `;

        const response = await model.generateContent(instruction);
        const textResponse = response.response.text();
        const match = textResponse.match(/Score:\s*(\d+)/);

        return match ? parseInt(match[1]) : 0;
    } catch (error) {
        console.error("❌ Error in Gemini AI:", error);
        return 0;
    }
};

const processMatching = async (req, res) => {
    try {
        // Get application IDs from request body or process all applications
        const { applicationIds } = req.body;

        // Query to find applications to process
        const query = applicationIds && applicationIds.length > 0
            ? { _id: { $in: applicationIds } }
            : {};

        const applications = await Application.find(query);

        for (let app of applications) {
            if (app.jobDescriptionText && app.resumeText) {
                const score = await generateSimilarityScore(app.jobDescriptionText, app.resumeText);
                await Application.updateOne({ _id: app._id }, { $set: { similarity: score } });
            }
        }

        res.json({
            message: "✅ Similarity scores updated!",
            count: applications.length
        });
    } catch (error) {
        console.error("❌ Error processing matching:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const applyForJob = async (req, res) => {
    const { resumeId, jobPostId, userId } = req.body;

    try {
        // Fetch the job post to get the job description
        const jobPost = await Jobpost.findById(jobPostId);
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

// Function to update application status
const updateApplicationStatus = async (req, res) => {
    const { status } = req.body;
    const applicationId = req.params.applicationId;

    if (!['Pending', 'Accepted', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value. Must be Pending, Accepted, or Rejected.' });
    }

    try {
        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        // Update the status
        application.status = status;
        await application.save();

        // Send email notification - could be implemented in the future
        // if (status === 'Accepted' || status === 'Rejected') {
        //     // Send email to candidate
        // }

        res.status(200).json({
            message: `Application status updated to ${status}`,
            application
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ message: 'Failed to update application status.' });
    }
};

module.exports = { applyForJob, getUserApplications, deleteApplication, getAllApplications, processMatching, generateSimilarityScore, updateApplicationStatus };