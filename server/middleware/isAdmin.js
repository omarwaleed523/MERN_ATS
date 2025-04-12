const User = require('../models/User');

// Middleware to check if user is an Administrator
module.exports = async (req, res, next) => {
  try {
    // Get user from auth middleware (which attaches req.user)
    const user = req.user; // User is already available from auth middleware
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is an Administrator
    if (user.role !== 'Administrator') {
      return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
    
    // User is an admin, proceed
    next();
  } catch (err) {
    console.error('Error in admin check middleware:', err);
    res.status(500).json({ message: 'Server error' });
  }
};