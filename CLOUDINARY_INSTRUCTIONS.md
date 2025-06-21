# Cloudinary Integration Instructions

This document explains how to set up Cloudinary for file uploads in the MERN ATS application.

## 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. After signing up, navigate to the Dashboard to find your account details

## 2. Obtain Cloudinary Credentials

From your Cloudinary dashboard, note down the following information:
- Cloud Name
- API Key
- API Secret

## 3. Update Environment Variables

Add the following variables to your `.env` file:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Replace the placeholder values with your actual Cloudinary credentials.

## 4. Deployment on Vercel

When deploying to Vercel, add these environment variables to your project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## 5. Testing Your Integration

After deploying, test the file upload functionality:
1. Register a new user with a profile picture or update an existing user's profile picture
2. Upload a resume file
3. Check that the images and files appear correctly and persist after page refreshes
4. Verify that the URLs are now Cloudinary URLs (should start with `https://res.cloudinary.com/`)

## Troubleshooting

If you encounter issues with the Cloudinary integration:

1. Verify your environment variables are correctly set
2. Check that your Cloudinary account is active
3. Look for any rate limiting or quota issues in your Cloudinary dashboard
4. Check the server logs for specific error messages
