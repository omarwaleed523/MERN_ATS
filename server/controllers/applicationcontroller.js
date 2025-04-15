const Application = require('../models/Application');
const Jobpost = require('../models/Jobpost');
const Resume = require('../models/Resume');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const generateSimilarityScore = async (jobDesc, resume, jobPostData) => {
    try {
        // Extract job requirements if jobPostData is provided
        let skillsRequired = [];
        let experienceRequired = [];
        let educationRequired = [];
        
        if (jobPostData) {
            if (jobPostData.skills && Array.isArray(jobPostData.skills)) {
                skillsRequired = jobPostData.skills;
            }
            
            if (jobPostData.experience && Array.isArray(jobPostData.experience)) {
                experienceRequired = jobPostData.experience.map(exp => 
                    `${exp.title} (${exp.dates || 'Not specified'})`
                );
            }
            
            if (jobPostData.education && Array.isArray(jobPostData.education)) {
                educationRequired = jobPostData.education.map(edu => 
                    `${edu.degree} from ${edu.university || 'any institution'}`
                );
            }
        }
        
        // Format specific requirements for the AI prompt
        const formattedRequirements = `
        Specific Job Requirements:
        - Skills: ${skillsRequired.length > 0 ? skillsRequired.join(', ') : 'Not explicitly specified'}
        - Experience: ${experienceRequired.length > 0 ? experienceRequired.join('; ') : 'Not explicitly specified'}
        - Education: ${educationRequired.length > 0 ? educationRequired.join('; ') : 'Not explicitly specified'}
        `;

        const instruction = `
      You are an AI recruiter. Compare the job description, specific job requirements, and candidate's resume.
      Rate similarity between 0 (not relevant) to 100 (perfect fit) based on how well the candidate's qualifications match the job requirements.
      
      Job Description:
      ${jobDesc}
      
      ${formattedRequirements}

      Candidate's Resume:
      ${resume}

      Focus strictly on the specific requirements mentioned in the job post when identifying gaps.
      
      Return in this exact format:
      Score: XX (numerical score based on how many of the required skills, experience, and education requirements are met)
      
      Missing Skills: [List specific required skills from the job requirements that are missing from the resume. Only include skills specifically mentioned in the job requirements]
      
      Missing Experience: [Identify specific experience requirements from the job post that the candidate lacks]
      
      Missing Education: [Identify any education requirements from the job that the candidate doesn't meet]
      
      Improvement Suggestions: [Provide 2-3 specific, actionable suggestions for improving the resume to better match this specific job. Focus on how to address the missing requirements]
    `;

        const response = await model.generateContent(instruction);
        const textResponse = response.response.text();
        
        // Extract score
        const scoreMatch = textResponse.match(/Score:\s*(\d+)/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        
        // Extract missing skills
        const missingSkillsMatch = textResponse.match(/Missing Skills:\s*(.+?)(?=Missing Experience:|$)/s);
        const missingSkills = missingSkillsMatch ? missingSkillsMatch[1].trim() : "";
        
        // Extract missing experience
        const missingExpMatch = textResponse.match(/Missing Experience:\s*(.+?)(?=Missing Education:|$)/s);
        const missingExperience = missingExpMatch ? missingExpMatch[1].trim() : "";
        
        // Extract missing education
        const missingEduMatch = textResponse.match(/Missing Education:\s*(.+?)(?=Improvement Suggestions:|$)/s);
        const missingEducation = missingEduMatch ? missingEduMatch[1].trim() : "";
        
        // Extract improvement suggestions
        const suggestionsMatch = textResponse.match(/Improvement Suggestions:\s*(.+?)$/s);
        const suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : "";
        
        // Format comprehensive missing requirements
        let formattedMissingRequirements = "";
        
        if (missingSkills && missingSkills !== "None" && !missingSkills.toLowerCase().includes("not mentioned") && !missingSkills.toLowerCase().includes("none found")) {
            formattedMissingRequirements += `Skills: ${missingSkills}\n\n`;
        }
        
        if (missingExperience && missingExperience !== "None" && !missingExperience.toLowerCase().includes("not mentioned") && !missingExperience.toLowerCase().includes("none found")) {
            formattedMissingRequirements += `Experience: ${missingExperience}\n\n`;
        }
        
        if (missingEducation && missingEducation !== "None" && !missingEducation.toLowerCase().includes("not mentioned") && !missingEducation.toLowerCase().includes("none found")) {
            formattedMissingRequirements += `Education: ${missingEducation}`;
        }
        
        if (!formattedMissingRequirements.trim()) {
            formattedMissingRequirements = "No specific missing requirements identified. Your resume covers most of the job requirements.";
        }
        
        return {
            score,
            missingSkills: formattedMissingRequirements,
            improvementSuggestions: suggestions
        };
    } catch (error) {
        console.error("❌ Error in Gemini AI:", error);
        return { score: 0, missingSkills: "", improvementSuggestions: "" };
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

        // Populate jobPostId to get access to skills, experience, and education requirements
        const applications = await Application.find(query).populate('jobPostId');

        let processedCount = 0;
        for (let app of applications) {
            if (app.jobDescriptionText && app.resumeText) {
                // Pass the job post data to the similarity score function
                const jobPostData = app.jobPostId ? {
                    skills: app.jobPostId.skills || [],
                    experience: app.jobPostId.experience || [],
                    education: app.jobPostId.education || []
                } : null;
                
                const result = await generateSimilarityScore(
                    app.jobDescriptionText, 
                    app.resumeText, 
                    jobPostData
                );
                
                await Application.updateOne(
                    { _id: app._id }, 
                    { 
                        $set: { 
                            similarity: result.score,
                            missingSkills: result.missingSkills,
                            improvementSuggestions: result.improvementSuggestions
                        } 
                    }
                );
                processedCount++;
            }
        }

        res.json({
            message: "✅ Similarity scores and improvement suggestions updated!",
            count: processedCount
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

const updateApplicationFeedback = async (req, res) => {
    const { applicationId } = req.params;
    const { missingSkills, improvementSuggestions } = req.body;

    if (!applicationId) {
        return res.status(400).json({ message: 'Application ID is required.' });
    }

    try {
        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        // Update the feedback fields
        if (missingSkills !== undefined) {
            application.missingSkills = missingSkills;
        }
        
        if (improvementSuggestions !== undefined) {
            application.improvementSuggestions = improvementSuggestions;
        }

        await application.save();

        res.status(200).json({
            message: 'Feedback updated successfully',
            application
        });
    } catch (error) {
        console.error('Error updating application feedback:', error);
        res.status(500).json({ message: 'Failed to update application feedback.' });
    }
};

module.exports = { applyForJob, getUserApplications, deleteApplication, getAllApplications, processMatching, generateSimilarityScore, updateApplicationStatus, updateApplicationFeedback };