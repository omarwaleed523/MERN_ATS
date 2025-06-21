const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  register,
  login,
  verifyToken,
  getUserProfile,
  updateUserProfile,
  updatePassword,
  updateProfilePicture,
  logout
} = require('../controllers/authController');

// Public routes (no authentication required)
router.post('/register', upload.single('profilepicture'), register);
router.post('/login', login);

// Protected routes (authentication required)
router.get('/verify-token', auth, verifyToken);
router.post('/logout', auth, logout);

// User profile routes
router.get('/user/:id', auth, getUserProfile);
router.put('/user/:id', auth, updateUserProfile);
router.put('/user/:id/password', auth, updatePassword);
router.put('/user/:id/profile-picture', auth, upload.single('profilepicture'), updateProfilePicture);

module.exports = router;