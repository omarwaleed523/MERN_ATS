const express = require('express');
const { uploadResume, fetchAllResumes, getResumesByUserId, getResumeById, updateResume, deleteResumeById } = require('../controllers/resumeController');
const upload = require('../middleware/upload');

const router = express.Router();

// Route to upload a resume
router.post('/upload', upload.single('resume'), uploadResume);

// Route to fetch all resumes
router.get('/', fetchAllResumes);

// Route to fetch resumes by user ID
router.get('/user/:userId', getResumesByUserId);

// Route to fetch a single resume by ID
router.get('/:resumeId', getResumeById);

// Route to update a resume
router.put('/:resumeId', updateResume);

// Route to delete a resume by ID
router.delete('/:resumeId', deleteResumeById);

module.exports = router;