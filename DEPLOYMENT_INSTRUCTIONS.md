# Deploying to Vercel

This document outlines the steps to deploy your MERN stack ATS application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional, but helpful)
3. Git repository connected to Vercel

## Deployment Steps

### 1. Set Up Environment Variables

In your Vercel project settings, add the following environment variables:

**For Server:**
- `MONGO_URI`: Your MongoDB connection string
- `NODE_ENV`: Set to `production`
- `CLIENT_URL`: The URL of your deployed client (will be available after deployment)
- `REACT_APP_GEMINI_KEY`: Your Gemini API key
- `EMAIL_SERVICE`: Your email service provider
- `EMAIL_USER`: Your email address
- `EMAIL_PASSWORD`: Your email password or app password
- `EMAIL_FROM_NAME`: The name shown in sent emails

**For Client:**
- `REACT_APP_BACKEND_URL`: The URL of your deployed server API

### 2. Configure File Storage (Important!)

Vercel's serverless functions don't support persistent file storage. Before deploying, implement a cloud storage solution as described in `VERCEL_DEPLOYMENT_NOTES.md`.

### 3. Deploy Your Application

#### Option 1: Using Vercel Dashboard

1. Connect your Git repository to Vercel
2. Configure the project:
   - Root Directory: `./`
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/build`
3. Add the environment variables mentioned above
4. Deploy

#### Option 2: Using Vercel CLI

1. Run `vercel` in the project root
2. Follow the CLI instructions to link to your Vercel project
3. Set the environment variables:
   ```
   vercel env add MONGO_URI
   vercel env add NODE_ENV
   ```
   etc.
4. Deploy:
   ```
   vercel --prod
   ```

### 4. Connect Client and Server

After both are deployed:
1. Get the URL of your server deployment
2. Update the `REACT_APP_BACKEND_URL` environment variable in the client's Vercel project settings
3. Redeploy the client if necessary

## Troubleshooting

### CORS Issues

If you encounter CORS issues:
1. Make sure the `CLIENT_URL` on the server points to your client's deployed URL
2. Verify that your CORS configuration in `server.js` is correctly using the environment variables

### File Upload Issues

Remember that Vercel doesn't support persistent file storage. Implement a cloud storage solution before deployment.

### API Routes Not Found

Make sure your vercel.json configuration is correctly routing API requests to your server.js file.
