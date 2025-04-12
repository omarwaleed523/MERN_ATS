const JobPost = require('../models/JobPost');
const { runPythonScript } = require('../utils/pythonRunnerJD');
const fs = require('fs').promises;
const multer = require('multer');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Multer storage for file uploads
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            await fs.mkdir(uploadsDir, { recursive: true });
            cb(null, uploadsDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
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
        const jobPost = new JobPost({
            jobTitle,
            salary,
            location,
            jobDescription,
            company,
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
            jobPosts = await JobPost.find({ userId }).populate('userId', 'name email company');
        } else {
            jobPosts = await JobPost.find().populate('userId', 'name email company');
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
        const jobPost = await JobPost.findById(jobPostId).populate('userId', 'name email company');
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
        const jobPost = await JobPost.findByIdAndUpdate(
            jobPostId,
            { jobTitle, salary, location, jobDescription, company, skills, experience, education, department, userId },
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
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const { userId } = req.body;
    if (!userId) {
        await fs.unlink(req.file.path).catch(console.error);
        return res.status(400).json({ message: 'User ID is required' });
    }

    const filePath = req.file.path;
    console.log(`Processing file: ${filePath}`);

    try {
        const pythonResponse = await runPythonScript(filePath);
        console.log('Python script response:', pythonResponse);

        if (!pythonResponse) {
            throw new Error('Failed to process job post file');
        }

        const jobPost = new JobPost({
            jobTitle: pythonResponse.jobTitle,
            salary: pythonResponse.salary,
            location: pythonResponse.location,
            jobDescription: pythonResponse.jobDescription,
            company: pythonResponse.company,
            skills: pythonResponse.skills,
            experience: pythonResponse.experience || [],
            education: pythonResponse.education || [],
            department: pythonResponse.department,
            userId
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

    } finally {
        // Clean up the uploaded file
        await fs.unlink(filePath).catch(console.error);
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