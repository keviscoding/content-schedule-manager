# Content Schedule Manager - Setup Guide

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas account)
- AWS S3 or Cloudflare R2 account for video storage

### Step 1: Install Dependencies

```bash
# Install all dependencies
npm run install:all
```

### Step 2: Configure Environment Variables

**Backend Configuration:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your settings:
```env
MONGODB_URI=mongodb://localhost:27017/content-schedule-manager
JWT_SECRET=your-random-secret-key-here
JWT_REFRESH_SECRET=your-random-refresh-secret-here
PORT=3001
FRONTEND_URL=http://localhost:5173

# For AWS S3
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY=your-aws-access-key
S3_SECRET_KEY=your-aws-secret-key

# For Cloudflare R2 (alternative to S3)
S3_BUCKET=your-bucket-name
S3_REGION=auto
S3_ACCESS_KEY=your-r2-access-key
S3_SECRET_KEY=your-r2-secret-key
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

**Frontend Configuration:**
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

### Step 3: Start Development Servers

```bash
# From root directory
npm run dev
```

This starts:
- Backend API: http://localhost:3001
- Frontend: http://localhost:5173

### Step 4: Create Your First Account

1. Open http://localhost:5173
2. Register with role "owner"
3. Start adding channels!

---

## Digital Ocean Deployment

### Option 1: App Platform (Easiest)

**Backend Deployment:**

1. Push your code to GitHub
2. Go to Digital Ocean App Platform
3. Create New App → Select your repository
4. Configure:
   - **Name:** content-schedule-backend
   - **Source Directory:** `/backend`
   - **Build Command:** `npm install && npm run build`
   - **Run Command:** `npm start`
   - **Environment Variables:** Add all from `.env`

**Frontend Deployment:**

1. Create another app for frontend
2. Configure:
   - **Name:** content-schedule-frontend
   - **Source Directory:** `/frontend`
   - **Build Command:** `npm install && npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:** 
     - `VITE_API_URL=https://your-backend-url.ondigitalocean.app`

### Option 2: Droplet (More Control)

**1. Create a Droplet:**
- Ubuntu 22.04 LTS
- At least 2GB RAM
- Choose your region

**2. SSH into your droplet:**
```bash
ssh root@your-droplet-ip
```

**3. Install Node.js and MongoDB:**
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
sudo npm install -g pm2
```

**4. Clone and setup your app:**
```bash
cd /var/www
git clone your-repo-url content-schedule-manager
cd content-schedule-manager
npm run install:all
```

**5. Configure environment:**
```bash
cd backend
nano .env
# Add your production environment variables
```

**6. Build and start:**
```bash
# Build backend
cd /var/www/content-schedule-manager/backend
npm run build

# Start with PM2
pm2 start dist/index.js --name content-schedule-api
pm2 save
pm2 startup

# Build frontend
cd /var/www/content-schedule-manager/frontend
npm run build
```

**7. Setup Nginx:**
```bash
sudo apt-get install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/content-schedule
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/content-schedule-manager/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/content-schedule /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**8. Setup SSL with Let's Encrypt:**
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## MongoDB Setup Options

### Option 1: Local MongoDB
Already covered in Droplet setup above.

### Option 2: MongoDB Atlas (Recommended for production)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or 0.0.0.0/0 for all IPs)
5. Get your connection string
6. Update `MONGODB_URI` in your `.env`

---

## Storage Setup

### Option 1: AWS S3

1. Create an S3 bucket
2. Create an IAM user with S3 permissions
3. Generate access keys
4. Update `.env` with credentials

### Option 2: Cloudflare R2 (Cheaper)

1. Go to Cloudflare Dashboard → R2
2. Create a bucket
3. Generate API tokens
4. Update `.env`:
```env
S3_BUCKET=your-bucket-name
S3_REGION=auto
S3_ACCESS_KEY=your-r2-access-key
S3_SECRET_KEY=your-r2-secret-key
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

### Option 3: Digital Ocean Spaces

1. Create a Space in Digital Ocean
2. Generate API keys
3. Update `.env`:
```env
S3_BUCKET=your-space-name
S3_REGION=nyc3
S3_ACCESS_KEY=your-spaces-key
S3_SECRET_KEY=your-spaces-secret
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
```

---

## How to Use the App

### For Channel Owners:

1. **Register/Login** as owner
2. **Add Channels:**
   - Click "Add Channel"
   - Enter channel name, YouTube URL, target posting time (e.g., "14:00")
3. **Add Inspiration Channels:**
   - Go to channel details
   - Add model channels you're copying
   - Quick links to check them out
4. **Invite Editors:**
   - Go to channel settings
   - Add editor by email
5. **Review Videos:**
   - Check pending videos
   - Approve, reject, or request changes
6. **Mark as Posted:**
   - When you post a video to YouTube
   - Mark it as posted in the app
   - Deadline timer resets

### For Editors:

1. **Register/Login** as editor
2. **Upload Videos:**
   - Select your assigned channel
   - Upload video file
   - Add title, description, tags
3. **Track Status:**
   - See if videos are pending, approved, or rejected
   - View feedback from owner

### Dashboard Features:

- **Color-coded status:**
  - 🟢 Green: On time (posted within 24 hours)
  - 🟡 Yellow: Due soon (approaching 24 hours)
  - 🔴 Red: Overdue (missed deadline)
- **Time since last post** for each channel
- **Pending videos count**
- **Sorted by urgency** (overdue first)

---

## Troubleshooting

### Backend won't start:
- Check MongoDB is running: `sudo systemctl status mongod`
- Check environment variables are set
- Check logs: `pm2 logs content-schedule-api`

### Can't upload videos:
- Verify S3/R2 credentials
- Check bucket permissions
- Check file size (max 500MB)

### Frontend can't connect to backend:
- Check `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend
- Check backend is running

---

## Useful Commands

```bash
# View backend logs
pm2 logs content-schedule-api

# Restart backend
pm2 restart content-schedule-api

# Check MongoDB status
sudo systemctl status mongod

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Rebuild frontend
cd frontend && npm run build

# Update code from git
git pull
npm run install:all
cd backend && npm run build
pm2 restart content-schedule-api
```

---

## Support

For issues or questions, check the logs first:
- Backend: `pm2 logs`
- Nginx: `/var/log/nginx/error.log`
- MongoDB: `/var/log/mongodb/mongod.log`
