const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController'); // Import register and login
const upload = require('../middleware/upload'); // Import upload middleware

// Register route with file upload
router.post('/register', upload.single('profilepicture'), register);

// Login route
router.post('/login', login);

module.exports = router;