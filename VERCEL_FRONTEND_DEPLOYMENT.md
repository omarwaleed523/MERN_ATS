# Vercel Deployment Instructions

When deploying your MERN ATS application to Vercel, follow these steps to ensure proper deployment:

## Frontend Deployment (Client)

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. In the "Configure Project" step:
   - Set the "Root Directory" to `client`
   - Framework Preset: Create React App
   - Build Command: `npm run build` (default)
   - Output Directory: `build` (default)
5. Add environment variables:
   - `REACT_APP_BACKEND_URL`: URL of your deployed backend API
6. Click "Deploy"

## Environment Variables

Ensure you have the following environment variables configured in your Vercel project settings:

- `REACT_APP_BACKEND_URL`: Your backend API URL
- Any other environment variables your client application uses

## Important Notes

1. The "Root Directory" setting is crucial - it must be set to `client` for proper deployment
2. If you need to redeploy, you can trigger a manual deployment from the Vercel dashboard
3. Vercel automatically handles HTTPS and CDN distribution

## Troubleshooting

If you encounter issues with the deployment:

1. Check the build logs in the Vercel dashboard
2. Verify that your project structure matches what Vercel expects
3. Ensure all environment variables are correctly set
4. Try setting the framework preset explicitly to "Create React App"
