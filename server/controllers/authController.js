// authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const path = require('path');

// Register User
const register = async (req, res) => {
  const { name, email, password, phonenumber, role } = req.body;
  const profilepicture = req.file ? path.basename(req.file.path) : null; // Store only the filename

  console.log('Received data:', { name, email, password, phonenumber, role, profilepicture }); // Log received data

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists:', email); // Log duplicate email
      return res.status(400).json({ msg: 'User already exists with this email.' });
    }

    // Create new user
    user = new User({ name, email, password, phonenumber, role, profilepicture });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();
    console.log('User saved successfully:', user); // Log successful save

    // Return success response
    res.status(201).json({ msg: 'User registered successfully.' });
  } catch (err) {
    console.error('Server error:', err); // Log server error
    res.status(500).send('Server error');
  }
};

// Login User
const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Received data:', { email, password }); // Log received data

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email); // Log user not found
      return res.status(400).json({ msg: 'Invalid email or password.' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password for user:', email); // Log invalid password
      return res.status(400).json({ msg: 'Invalid email or password.' });
    }

    // Return success response with profileImage
    res.status(200).json({
      msg: 'Login successful.',
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: `/uploads/${user.profilepicture}` // Construct the URL for the image
    });
  } catch (err) {
    console.error('Server error:', err); // Log server error
    res.status(500).send('Server error');
  }
};

// Export the functions
module.exports = { register, login };