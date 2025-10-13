# Fix Digital Ocean Deployment

The build succeeded but needs proper configuration. Here's how to fix it:

## The Issue

Digital Ocean detected your monorepo but doesn't know how to run the backend and frontend separately.

## Solution: Configure as Separate Components

### Step 1: Edit Your App in Digital Ocean

1. Go to your app in Digital Ocean
2. Click **"Settings"** tab
3. Click **"Edit Plan"** or **"Components"**

### Step 2: Delete the Auto-Detected Component

1. Delete the component that was auto-created
2. We'll add backend and frontend manually

### Step 3: Add Backend Component

Click **"Add Component"** → **"Web Service"**

**Backend Settings:**
- **Name:** `backend`
- **Source Directory:** `/backend`
- **Build Command:** `npm install && npm run build`
- **Run Command:** `node dist/index.js`
- **HTTP Port:** `8080` (Digital Ocean default)
- **Environment Variables:**
  ```
  MONGODB_URI=mongodb+srv://contentmanagerkevis:2m6fsKG3ecPproYq@cluster0.xtw7jcq.mongodb.net/content-schedule-manager?retryWrites=true&w=majority&appName=Cluster0
  
  JWT_SECRET=<generate-a-random-secret>
  
  JWT_REFRESH_SECRET=<generate-another-random-secret>
  
  PORT=8080
  
  FRONTEND_URL=${frontend.PUBLIC_URL}
  ```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Add Frontend Component

Click **"Add Component"** → **"Static Site"**

**Frontend Settings:**
- **Name:** `frontend`
- **Source Directory:** `/frontend`
- **Build Command:** `npm install && npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  ```
  VITE_API_URL=${backend.PUBLIC_URL}
  ```

### Step 5: Deploy

1. Click **"Save"**
2. Click **"Deploy"**
3. Wait 5-10 minutes

## Alternative: Quick Fix with Procfile

Or add a `Procfile` to tell Digital Ocean what to run:

Create `backend/Procfile`:
```
web: node dist/index.js
```

Create `frontend/Procfile`:
```
web: npx serve dist -s -p $PORT
```

Then push:
```bash
git add .
git commit -m "Add Procfiles for Digital Ocean"
git push
```

---

## Expected Result

After configuration:
- **Backend URL:** `https://backend-xxxxx.ondigitalocean.app`
- **Frontend URL:** `https://frontend-xxxxx.ondigitalocean.app`

Your app will be live! 🎉

## If Still Having Issues

Try deploying backend and frontend as **separate apps**:

1. Create App 1: Backend only
   - Repository: `keviscoding/content-schedule-manager`
   - Source Directory: `/backend`
   
2. Create App 2: Frontend only
   - Repository: `keviscoding/content-schedule-manager`
   - Source Directory: `/frontend`
   - Environment: `VITE_API_URL=<backend-url-from-app-1>`

This is more expensive ($10/month instead of $5) but simpler to configure.
