const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phonenumber: { type: Number },
  role: { type: String, enum: ['Recruiter', 'Administrator', 'Candidate'], required: true },
  profilepicture: { type: String },
  company: { type: String }, // Added company field for recruiters
});

module.exports = mongoose.model('User', UserSchema);