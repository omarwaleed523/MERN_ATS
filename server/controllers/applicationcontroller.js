const Application = require('../models/Application');
const Jobpost = require('../models/Jobpost');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { sendApplicationStatusEmail } = require('../utils/emailNotifications');
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
      
      Missing Skills: [List each missing skill on a new numbered line like "1. Skill name", "2. Skill name", etc.]
      
      Missing Experience: [List each missing experience requirement on a new numbered line like "1. Experience detail", "2. Experience detail", etc.]
      
      Missing Education: [List each missing education requirement on a new numbered line like "1. Education requirement", "2. Education requirement", etc.]
      
      Improvement Suggestions: [List each suggestion on a new numbered line like "1. Suggestion", "2. Suggestion", "3. Suggestion"]
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
        
        // Extract missing education - FIX HERE
        const missingEduMatch = textResponse.match(/Missing Education:\s*(.+?)(?=Improvement Suggestions:|$)/s);
        const missingEducation = missingEduMatch ? missingEduMatch[1].trim() : "";
        
        // Extract improvement suggestions
        const suggestionsMatch = textResponse.match(/Improvement Suggestions:\s*(.+?)$/s);
        const suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : "";
        
        // Format comprehensive missing requirements with clear section separation
        let formattedMissingRequirements = "";
        
        if (missingSkills && missingSkills !== "None" && !missingSkills.toLowerCase().includes("not mentioned") && !missingSkills.toLowerCase().includes("none found")) {
            formattedMissingRequirements += `Skills:\n${missingSkills}\n\n`;
        }
        
        if (missingExperience && missingExperience !== "None" && !missingExperience.toLowerCase().includes("not mentioned") && !missingExperience.toLowerCase().includes("none found")) {
            formattedMissingRequirements += `Experience:\n${missingExperience}\n\n`;
        }
        
        if (missingEducation && missingEducation !== "None" && !missingEducation.toLowerCase().includes("not mentioned") && !missingEducation.toLowerCase().includes("none found")) {
            formattedMissingRequirements += `Education:\n${missingEducation}`;
        }
        
        if (!formattedMissingRequirements.trim()) {
            formattedMissingRequirements = "No specific missing requirements identified. Your resume covers most of the job requirements.";
        }
        
        // Format the improvement suggestions for better readability
        let formattedSuggestions = suggestions;
        if (!formattedSuggestions.match(/^\d+\.\s/m) && formattedSuggestions) {
            // If suggestions aren't already enumerated, add enumeration manually
            formattedSuggestions = formattedSuggestions
                .split(/(?:\r?\n)+/)
                .filter(s => s.trim())
                .map((suggestion, index) => `${index + 1}. ${suggestion.trim().replace(/^-\s*/, '')}`)
                .join('\n');
        }
        
        return {
            score,
            missingSkills: formattedMissingRequirements,
            improvementSuggestions: formattedSuggestions
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

        // Get the user data for email notification
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
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
        
        // Automatically calculate similarity score after application submission
        console.log("Calculating similarity score automatically for new application...");
        
        // Extract job post data for similarity calculation
        const jobPostData = {
            skills: jobPost.skills || [],
            experience: jobPost.experience || [],
            education: jobPost.education || []
        };
        
        // Generate similarity score using the AI matching system
        const result = await generateSimilarityScore(
            application.jobDescriptionText,
            application.resumeText,
            jobPostData
        );
        
        // Update the application with similarity score and feedback
        application.similarity = result.score;
        application.missingSkills = result.missingSkills;
        application.improvementSuggestions = result.improvementSuggestions;
        
        // Save the updated application
        await application.save();

        // Prepare application for email notification by populating relations
        application.userId = user;
        application.jobPostId = jobPost;

        // Send application confirmation email
        try {
            const emailSuccess = await sendApplicationStatusEmail(application);
            
            if (emailSuccess) {
                // Record that notification was sent successfully
                application.notificationsSent = [{
                    status: application.status,
                    sentAt: new Date(),
                    successful: true
                }];
                
                // Update the status history entry to show email was sent
                if (application.statusHistory && application.statusHistory.length > 0) {
                    application.statusHistory[0].emailSent = true;
                }
                
                await application.save();
                console.log(`Application confirmation email sent to ${user.email}`);
            }
        } catch (emailError) {
            console.error('Error sending application confirmation email:', emailError);
            // Continue with the response even if email sending fails
        }

        res.status(201).json({ 
            message: 'Application submitted successfully!', 
            application,
            similarityScore: result.score,
            emailSent: application.notificationsSent?.[0]?.successful || false
        });
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
    const { 
        status, 
        notes, 
        rejectionReason, 
        interviewNotes, 
        assessmentResults,
        nextSteps
    } = req.body;
    const applicationId = req.params.applicationId;

    // Updated valid statuses based on our expanded model
    const validStatuses = [
        'Draft', 'Submitted', 'Under Review', 'Shortlisted', 
        'Interview Scheduled', 'Interviewed', 'Assessment', 'Reference Check',
        'Offer Extended', 'Offer Accepted', 'Offer Declined', 
        'Hired', 'Rejected', 'Withdrawn'
    ];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            message: `Invalid status value. Must be one of: ${validStatuses.join(', ')}` 
        });
    }

    try {
        // Find application and populate the user, job post, and recruiter for the email
        // Set strictPopulate to false to avoid StrictPopulateError
        const application = await Application.findById(applicationId)
            .populate('userId', 'name email')
            .populate({
                path: 'jobPostId',
                populate: {
                    path: 'recruiter',
                    select: 'name email phone',
                    strictPopulate: false
                }
            });

        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }
        
        // Store the previous status for comparison
        const previousStatus = application.status;
        
        // Skip status update if it's the same status to prevent duplicate entries
        if (previousStatus === status) {
            return res.status(200).json({
                message: `Application already has status: ${status}`,
                application,
                emailSent: false
            });
        }

        // Update the status
        application.status = status;
        
        // Update optional fields if provided
        if (rejectionReason !== undefined) {
            application.rejectionReason = rejectionReason;
        }
        
        if (interviewNotes !== undefined) {
            application.interviewNotes = interviewNotes;
        }
        
        if (assessmentResults !== undefined) {
            application.assessmentResults = assessmentResults;
        }
        
        if (nextSteps !== undefined) {
            application.nextSteps = nextSteps;
        }
        
        // Initialize status history if it doesn't exist
        if (!application.statusHistory) {
            application.statusHistory = [];
        }
        
        // Add the history entry
        const historyEntry = {
            status,
            changedAt: new Date(),
            changedBy: req.user ? req.user._id : null,
            notes: notes || `Status changed to ${status}`,
            emailSent: false // Will update this after attempting to send the email
        };
        
        application.statusHistory.push(historyEntry);
        
        // Update current stage start date
        application.currentStageStartDate = new Date();
        
        // Save the application first to ensure it's updated in the database
        await application.save();

        // If this is a rejection status, make sure we include the missing skills and improvement suggestions
        if (status === 'Rejected') {
            // If no explicit rejection reason was provided, but we have AI-generated missing skills info,
            // use that as the rejection reason to provide useful feedback
            if (!rejectionReason && application.missingSkills) {
                application.rejectionReason = `Based on our evaluation of your qualifications against the job requirements, we've identified some areas where your profile didn't fully match our needs for this specific role.`;
            }
            
            // Make sure missingSkills and improvementSuggestions are set on the application for the email
            if (!application.missingSkills && application.similarity !== undefined && application.similarity < 70) {
                application.missingSkills = "Your overall match score with this position was below our threshold for this role.";
            }
        }

        // Send email notification since the status has changed
        try {
            // Send the email notification
            const emailSuccess = await sendApplicationStatusEmail(application, previousStatus);
            
            // Update the status history entry to reflect that an email was sent
            if (emailSuccess) {
                // Record that notification was sent successfully
                application.notificationsSent.push({
                    status,
                    sentAt: new Date(),
                    successful: true
                });
                
                // Update the emailSent flag in the most recent history entry
                if (application.statusHistory.length > 0) {
                    const lastEntry = application.statusHistory[application.statusHistory.length - 1];
                    lastEntry.emailSent = true;
                }
                
                // Save the updated application with notification record
                await application.save();
                
                console.log(`Email notification sent for application ${applicationId} status change to ${status}`);
            } else {
                // Record that notification attempt failed
                application.notificationsSent.push({
                    status,
                    sentAt: new Date(),
                    successful: false
                });
                await application.save();
                
                console.log(`Failed to send email notification for application ${applicationId}`);
            }
        } catch (emailError) {
            console.error('Error sending status change email:', emailError);
            // Continue with the response even if email sending fails
        }

        res.status(200).json({
            message: `Application status updated to ${status}`,
            application,
            emailSent: application.statusHistory[application.statusHistory.length - 1].emailSent
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

// Get application status history
const getApplicationStatusHistory = async (req, res) => {
    const { applicationId } = req.params;

    try {
        const application = await Application.findById(applicationId)
            .populate('statusHistory.changedBy', 'name email role');

        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        res.status(200).json({
            applicationId: application._id,
            currentStatus: application.status,
            history: application.statusHistory || []
        });
    } catch (error) {
        console.error('Error retrieving application status history:', error);
        res.status(500).json({ message: 'Failed to retrieve application status history.' });
    }
};

module.exports = { 
    applyForJob, 
    getUserApplications, 
    deleteApplication, 
    getAllApplications, 
    processMatching, 
    generateSimilarityScore, 
    updateApplicationStatus, 
    updateApplicationFeedback,
    getApplicationStatusHistory 
};