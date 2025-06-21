const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Ensure environment variables are loaded
dotenv.config();

// Check if env variables are available
const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile)) {
  console.log('.env file found in server root directory');
  dotenv.config({ path: envFile });
} else {
  console.log('.env file not found in server root directory');
}

// Log Cloudinary config to help debug (without exposing the full API secret)
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'Not set',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Key provided' : 'Not set',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Secret provided' : 'Not set'
});

// Cloudinary configuration with direct values if env vars not available
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dweizkd0i';
const apiKey = process.env.CLOUDINARY_API_KEY || '867859358279172';
const apiSecret = process.env.CLOUDINARY_API_SECRET || '-v4WZOsrb80UrJUDcXbOeBNbWq0';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

// Configure multer with memory storage for temporary holding
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow document file types (PDF, DOCX) in addition to images
    const filetypes = /jpeg|jpg|png|gif|heic|pdf|docx|doc/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype) || 
                    file.mimetype === 'application/pdf' || 
                    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    file.mimetype === 'application/msword';
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, HEIC, PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// Function to upload to cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    // Verify Cloudinary configuration is available
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration is missing. Please check your .env file.');
      return reject(new Error('Cloudinary configuration is missing. Please check your .env file.'));
    }
    
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: folder || 'profile_pictures',
        resource_type: 'auto' // Allow Cloudinary to detect file type automatically (including raw files like PDFs and DOCXs)
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        console.log('Successfully uploaded to Cloudinary folder:', folder || 'profile_pictures');
        resolve(result);
      }
    );
    
    // Convert buffer to stream and pipe to uploadStream
    const streamifier = require('streamifier');
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = {
  cloudinary,
  upload,
  uploadToCloudinary
};
