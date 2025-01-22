const express = require('express');
const { createJobPost, getAllJobPosts, getJobPostById, updateJobPost, deleteJobPost } = require('../controllers/jobPostController');

const router = express.Router();

router.post('/', createJobPost);

router.get('/', getAllJobPosts);

router.get('/:jobPostId', getJobPostById);

router.put('/:jobPostId', updateJobPost);

router.delete('/:jobPostId', deleteJobPost);

module.exports = router;