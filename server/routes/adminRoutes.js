const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Protect all admin routes with auth middleware and admin check
router.use(auth);
router.use(isAdmin);

// Dashboard statistics
router.get('/stats', adminController.getSystemStats);

// Recent users and jobs
router.get('/recent-users', adminController.getRecentUsers);
router.get('/recent-jobs', adminController.getRecentJobs);

// New analytics endpoints
router.get('/top-skills', adminController.getTopSkills);
router.get('/company-stats', adminController.getCompanyStats);
router.get('/activity-timeline', adminController.getActivityTimeline);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

// Interview management (new routes)
router.get('/interviews', adminController.getAllInterviews);
router.get('/interviews/:id', adminController.getInterviewById);
router.put('/interviews/:id', adminController.updateInterview);
router.delete('/interviews/:id', adminController.deleteInterview);

// Database schemas
router.get('/schemas', adminController.getSchemas);

module.exports = router;