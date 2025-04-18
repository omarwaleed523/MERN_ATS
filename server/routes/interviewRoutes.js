const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const auth = require('../middleware/auth');

// Create a new interview - only recruiters and admins
router.post(
    '/', 
    auth, 
    (req, res, next) => {
        if (req.user.role !== 'Recruiter' && req.user.role !== 'Administrator') {
            return res.status(403).json({ message: 'Permission denied' });
        }
        next();
    },
    interviewController.createInterview
);

// Get all interviews for the authenticated user (role-based filtering)
router.get('/', auth, interviewController.getInterviews);

// Get specific interview by ID
router.get('/:id', auth, interviewController.getInterviewById);

// Update interview by ID - only recruiters who created it and admins
router.put('/:id', auth, interviewController.updateInterview);

// Delete interview by ID - only recruiters who created it and admins
router.delete('/:id', auth, interviewController.deleteInterview);

// Get all interviews for a specific application
router.get('/application/:applicationId', auth, interviewController.getInterviewsByApplication);

module.exports = router;