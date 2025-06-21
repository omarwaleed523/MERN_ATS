const multer = require('multer');
const path = require('path');

// We'll use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

// Initialize upload middleware with file filtering
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow PDF and document file types for resumes
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

module.exports = upload;