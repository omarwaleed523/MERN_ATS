// authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'MERN_ATS_secure_key_2024';

/**
 * Generate a JWT token for authentication
 * @param {Object} user - The user object to encode in the token
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
  const { name, email, password, phonenumber, role, company } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create new user instance
    const user = new User({
      name,
      email,
      password,
      phonenumber,
      role: role || 'Candidate', // Default to Candidate if no role provided
      company: role === 'Recruiter' ? company : undefined // Only set company for recruiters
    });
    
    // Handle profile picture if provided
    if (req.file) {
      user.profilepicture = `/uploads/${req.file.filename}`;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Save user to database
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return success response with user data and token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

/**
 * Authenticate user and issue token
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    // Check if user exists
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Format profile image URL if exists
    const profileImage = user.profilepicture 
      ? `/uploads/${path.basename(user.profilepicture)}`
      : null;
    
    // Return success response with user data and token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      profileImage,
      token
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

/**
 * Get current authenticated user's profile
 * @route GET /api/auth/user/:id
 */
const getUserProfile = async (req, res) => {
  try {
    // req.params.id should match the authenticated user or request should be from an admin
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'Administrator') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only access your own profile'
      });
    }
    
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found'
      });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile',
      error: error.message
    });
  }
};

/**
 * Update user profile information
 * @route PUT /api/auth/user/:id
 */
const updateUserProfile = async (req, res) => {
  const { name, email, phonenumber, company } = req.body;
  
  try {
    // Check if user is updating their own profile
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'Administrator') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own profile'
      });
    }
    
    // Find user by ID
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if new email is already in use by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another account'
        });
      }
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phonenumber) user.phonenumber = phonenumber;
    // Only update company field for recruiters
    if (company && user.role === 'Recruiter') user.company = company;
    
    // Save updated user
    await user.save();
    
    // Return success response
    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phonenumber: user.phonenumber,
        role: user.role,
        company: user.company,
        profilepicture: user.profilepicture
      }
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: error.message
    });
  }
};

/**
 * Update user password
 * @route PUT /api/auth/user/:id/password
 */
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    });
  }
  
  try {
    // Check if user is updating their own password
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'Administrator') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own password'
      });
    }
    
    // Find user by ID (including password field)
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Save user with new password
    await user.save();
    
    // Return success response
    res.json({ 
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating password',
      error: error.message
    });
  }
};

/**
 * Update user profile picture
 * @route PUT /api/auth/user/:id/profile-picture
 */
const updateProfilePicture = async (req, res) => {
  try {
    // Check if user is updating their own profile picture
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'Administrator') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own profile picture'
      });
    }
    
    // Find user by ID
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found'
      });
    }
    
    // Handle file upload
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Delete old profile picture if exists
    if (user.profilepicture) {
      try {
        const oldPicturePath = path.join(__dirname, '..', user.profilepicture);
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      } catch (err) {
        console.error('Error deleting old profile picture:', err);
      }
    }
    
    // Update with new picture path
    user.profilepicture = `/uploads/${req.file.filename}`;
    await user.save();
    
    // Return success response
    res.json({ 
      success: true,
      message: 'Profile picture updated successfully',
      profilepicture: user.profilepicture
    });
  } catch (error) {
    console.error('Update profile picture error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile picture',
      error: error.message
    });
  }
};

/**
 * Verify if token is valid
 * @route GET /api/auth/verify-token
 */
const verifyToken = async (req, res) => {
  // If middleware passes, the token is valid and req.user is set
  try {
    res.status(200).json({ 
      success: true,
      valid: true, 
      user: {
        userId: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profileImage: req.user.profilepicture
      }
    });
  } catch (error) {
    console.error('Verify token error:', error.message);
    res.status(401).json({
      success: false,
      valid: false,
      message: 'Token verification failed'
    });
  }
};

/**
 * Logout user (stateless, just for API completeness)
 * @route POST /api/auth/logout
 */
const logout = async (req, res) => {
  // Since JWT is stateless, we don't need server-side logout
  // Client will handle removing the token
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

// Export controller functions
module.exports = {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  updatePassword,
  updateProfilePicture,
  verifyToken,
  logout
};