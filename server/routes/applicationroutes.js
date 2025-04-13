const express = require('express');
const { applyForJob, getUserApplications, deleteApplication, getAllApplications, processMatching, generateSimilarityScore, updateApplicationStatus } = require('../controllers/applicationcontroller');

const router = express.Router();

// Route to apply for a job
router.post('/apply', applyForJob);

// Process AI matching for applications
router.post('/process-matching', processMatching);

// Route to get all applications (for admin)
router.get('/all', getAllApplications);

// Route to get applications for a specific user
router.get('/:userId', getUserApplications);

// Default route (should come after specific routes)
router.get('/', getAllApplications);

// Route to delete an application
router.delete('/:applicationId', deleteApplication);

// Route to update application status
router.put('/:applicationId/status', updateApplicationStatus);

module.exports = router;