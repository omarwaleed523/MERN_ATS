const express = require('express');
const { applyForJob, getUserApplications, deleteApplication } = require('../controllers/applicationcontroller');

const router = express.Router();

// Route to apply for a job
router.post('/apply', applyForJob);

// Route to get applications for a specific user
router.get('/', getUserApplications);

// Route to delete an application
router.delete('/:applicationId', deleteApplication);

module.exports = router;