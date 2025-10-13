# Deploy to Digital Ocean App Platform

## Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Content Schedule Manager"

# Add your GitHub repo as remote
git remote add origin https://github.com/keviscoding/content-schedule-manager.git

# Push to GitHub
git push -u origin main
```

If you get an error about the branch name, try:
```bash
git branch -M main
git push -u origin main
```

## Step 2: Create App on Digital Ocean

1. Go to https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. Choose **"GitHub"** as source
4. Select your repository: `keviscoding/content-schedule-manager`
5. Click **"Next"**

## Step 3: Configure Backend

Digital Ocean should auto-detect both apps. Configure the backend:

**Backend Settings:**
- **Name:** `content-schedule-backend`
- **Source Directory:** `/backend`
- **Build Command:** `npm install && npm run build`
- **Run Command:** `node dist/index.js`
- **HTTP Port:** `3001`

**Environment Variables (click "Edit" next to Environment Variables):**
```
MONGODB_URI=mongodb+srv://contentmanagerkevis:2m6fsKG3ecPproYq@cluster0.xtw7jcq.mongodb.net/content-schedule-manager?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET=your-super-secret-production-key-change-this

JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

PORT=3001

FRONTEND_URL=${frontend.PUBLIC_URL}
```

**Important:** 
- Change the JWT secrets to random strings
- The `${frontend.PUBLIC_URL}` will auto-populate with your frontend URL

## Step 4: Configure Frontend

**Frontend Settings:**
- **Name:** `content-schedule-frontend`
- **Source Directory:** `/frontend`
- **Build Command:** `npm install && npm run build`
- **Output Directory:** `dist`

**Environment Variables:**
```
VITE_API_URL=${backend.PUBLIC_URL}
```

This will auto-populate with your backend URL.

## Step 5: Deploy!

1. Click **"Next"**
2. Review your settings
3. Click **"Create Resources"**
4. Wait 5-10 minutes for deployment

## Step 6: Get Your URLs

Once deployed, you'll get two URLs:
- **Frontend:** `https://content-schedule-frontend-xxxxx.ondigitalocean.app`
- **Backend:** `https://content-schedule-backend-xxxxx.ondigitalocean.app`

Your app is now live! 🎉

## Step 7: Update MongoDB Atlas IP Whitelist

1. Go to MongoDB Atlas
2. Click **"Network Access"**
3. Click **"Add IP Address"**
4. Add `0.0.0.0/0` to allow from anywhere
5. Or add Digital Ocean's IP ranges

## Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Check MongoDB connection string
- View logs in Digital Ocean dashboard

### Frontend can't connect to backend
- Make sure `VITE_API_URL` is set to backend URL
- Check CORS settings in backend
- Verify backend is running

### Database connection fails
- Check MongoDB Atlas IP whitelist
- Verify connection string is correct
- Check MongoDB Atlas user credentials

## Updating Your App

After making changes:

```bash
git add .
git commit -m "Your update message"
git push
```

Digital Ocean will automatically redeploy! 🚀

## Cost

- **App Platform:** $5/month per app (so $10/month total)
- **MongoDB Atlas:** Free (M0 tier)
- **Total:** ~$10/month

## Alternative: Use One App

To save money, you can deploy both in one app:

1. Create a single app
2. Add both backend and frontend as components
3. Cost: $5/month total

---

**Your app will be live at:**
- Frontend: `https://your-frontend-url.ondigitalocean.app`
- Backend: `https://your-backend-url.ondigitalocean.app`

Share the frontend URL with your team! 🎉
