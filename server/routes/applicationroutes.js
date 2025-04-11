const express = require('express');
const { applyForJob, getUserApplications, deleteApplication, getAllApplications, processMatching, generateSimilarityScore, updateApplicationStatus } = require('../controllers/applicationcontroller');

const router = express.Router();

// Route to apply for a job
router.post('/apply', applyForJob);

//processmatching
router.post('/processmatching', processMatching);

// Route to get applications for a specific user
router.get('/:userId', getUserApplications);

router.get('/', getAllApplications);

// Route to delete an application
router.delete('/:applicationId', deleteApplication);

// Route to update application status
router.patch('/:applicationId/status', updateApplicationStatus);

module.exports = router;