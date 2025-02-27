const express = require('express');
const { createJobPost, getAllJobPosts, getJobPostById, updateJobPost, deleteJobPost, uploadJobPost, uploadFile } = require('../controllers/jobPostController');

const router = express.Router();

router.post('/', createJobPost);

router.get('/', getAllJobPosts);

router.get('/:jobPostId', getJobPostById);

router.put('/:jobPostId', updateJobPost);

router.delete('/:jobPostId', deleteJobPost);

// New route for uploading job post files.
router.post('/upload', uploadFile.single('jobfile'), uploadJobPost);

module.exports = router;