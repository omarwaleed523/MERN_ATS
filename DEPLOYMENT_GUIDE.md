# Vercel Deployment Instructions

## Important: Deploy Server and Client as Separate Projects

This is a MERN stack application that should be deployed as two separate projects on Vercel.

## Server Deployment

1. **Create a new project in Vercel Dashboard**
   - Select your GitHub repository
   - Set the "Root Directory" to `server`
   - Build Command: Leave as default
   - Output Directory: Leave as default

2. **Set Environment Variables in Vercel**
   - MONGO_URI
   - CLIENT_URL (set to your deployed client URL)
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - EMAIL_SERVICE
   - EMAIL_USER
   - EMAIL_PASSWORD
   - EMAIL_FROM_NAME
   - REACT_APP_GEMINI_KEY
   - NODE_ENV=production

3. **Deploy**
   - Click "Deploy" and wait for your API to be live

## Client Deployment

1. **Create a new project in Vercel Dashboard**
   - Select your GitHub repository
   - Set the "Root Directory" to `client`
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

2. **Set Environment Variables in Vercel**
   - REACT_APP_BACKEND_URL (set to your deployed server URL)

3. **Deploy**
   - Click "Deploy" and wait for your client to be live

## Testing Your Deployment

1. Test the client application by visiting your deployed client URL
2. Test API endpoints using tools like Postman
3. Verify that file uploads work with Cloudinary

## Troubleshooting

- **Deployment Fails**: Check build logs for errors
- **API Connection Issues**: Verify environment variables, especially REACT_APP_BACKEND_URL and CLIENT_URL
- **CORS Errors**: Ensure your server's CORS configuration allows requests from your client's domain

Remember to follow these instructions exactly to avoid issues with the deployment process. Deploy the server and client as separate Vercel projects, each with its own configuration.
