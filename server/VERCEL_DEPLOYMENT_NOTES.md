# Important Note About File Uploads on Vercel

Your application currently uses local file storage (`uploads/` directory) for storing uploaded files. However, Vercel's serverless functions don't support persistent file storage.

For production deployment on Vercel, you should consider using a cloud storage solution such as:

1. **AWS S3**
2. **Google Cloud Storage**
3. **Cloudinary** (Especially good for image handling)
4. **Firebase Storage**

## Implementation Example with Cloudinary

Here's how you could modify your upload middleware using Cloudinary:

```javascript
// Install the package: npm install cloudinary multer-storage-cloudinary
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ats_uploads',
    allowed_formats: ['jpg', 'png', 'pdf', 'heic', 'gif']
  }
});

// Create the multer upload middleware
const upload = multer({ storage: storage });

module.exports = upload;
```

Remember to add the required environment variables in your Vercel project settings:
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

Without implementing a solution like this, any files uploaded to your application on Vercel will be temporary and will be lost when the serverless function completes execution.
