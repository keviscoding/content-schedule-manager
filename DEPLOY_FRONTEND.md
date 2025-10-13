# Frontend Deployment Guide

## Quick Deploy to Digital Ocean

### Step 1: Get Your Backend URL
Your backend is already deployed. Get the URL from Digital Ocean (it looks like: `https://your-app-name.ondigitalocean.app`)

### Step 2: Update Environment Variable
Edit `frontend/.env.production` and replace `YOUR_BACKEND_URL_HERE` with your actual backend URL.

### Step 3: Deploy Frontend to Digital Ocean

1. Go to Digital Ocean Dashboard
2. Click "Create" → "App"
3. Choose "GitHub" as source
4. Select your repository: `content-schedule-manager`
5. Digital Ocean will detect both backend and frontend

**Configure Frontend Component:**
- Name: `frontend`
- Source Directory: `/frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_API_URL` = `https://your-backend-url.ondigitalocean.app`

6. Click "Next" → "Create Resources"

### Step 4: Update Backend CORS
Once frontend is deployed, update your backend environment variable:
- `FRONTEND_URL` = `https://your-frontend-url.ondigitalocean.app`

## Alternative: Deploy Frontend Only (Easier)

If you want to deploy just the frontend separately:

1. Go to Digital Ocean Dashboard
2. Create a new Static Site app
3. Connect to GitHub repo
4. Set:
   - Source Directory: `/frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_URL` = your backend URL

Done! Your app will be live in a few minutes.
