const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
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

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Set up multer upload with file type filtering
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|heic|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, HEIC and PDF files are allowed'));
    }
  }
});

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