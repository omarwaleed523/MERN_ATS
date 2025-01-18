const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phonenumber: { type: Number },
  role: { type: String, enum: ['Recruiter', 'Administrator', 'Candidate'], required: true }, // Add role field
  profilepicture: { type: String }, // Add profile picture field
});

module.exports = mongoose.model('User', UserSchema);