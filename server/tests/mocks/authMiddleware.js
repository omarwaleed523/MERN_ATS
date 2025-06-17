// Mock middleware for auth
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

/**
 * Middleware to mock authentication for testing
 * This avoids the need to pass x-auth-token header in tests
 */
const mockAuth = async (req, res, next) => {
  // If the test has set a user ID in the request object, use it
  if (req.user && req.user.id) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      req.user = { id: user._id, role: user.role };
      return next();
    } catch (err) {
      console.error('Error in mockAuth middleware:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
  
  // Otherwise, check for a token in the headers
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = mockAuth;
