const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'MERN_ATS_secure_key_2024';

/**
 * Authentication middleware
 * Verifies the JWT token in the Authorization header or x-auth-token header
 * Sets the authenticated user in the request object
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header - check both Authorization and x-auth-token headers
    let token;
    const authHeader = req.headers.authorization;
    const xAuthToken = req.headers['x-auth-token'];
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (xAuthToken) {
      token = xAuthToken;
    } else {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No valid token provided.' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token: User not found' 
      });
    }
    
    // Set user in request object
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired', 
        expired: true 
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

module.exports = auth;