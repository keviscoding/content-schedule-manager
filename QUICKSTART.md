# Quick Start Guide

## Get Running in 5 Minutes

### 1. Install Everything
```bash
npm run install:all
```

### 2. Setup Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` - **minimum required:**
```env
MONGODB_URI=mongodb://localhost:27017/content-schedule-manager
JWT_SECRET=any-random-string-here
JWT_REFRESH_SECRET=another-random-string
```

### 3. Setup Frontend Environment
```bash
cd frontend
cp .env.example .env
```

The defaults work for local development!

### 4. Start Everything
```bash
# From root directory
npm run dev
```

### 5. Open Browser
Go to: http://localhost:5173

---

## First Time Setup

1. **Register** - Create an owner account
2. **Add a Channel:**
   - Name: "My Gaming Channel"
   - YouTube URL: https://youtube.com/@yourchannel
   - Target Time: "14:00" (2 PM)
3. **Done!** The app will now track when you need to post

---

## API Endpoints (for testing)

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "owner"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123"
  }'
```

### Create Channel (use token from login)
```bash
curl -X POST http://localhost:3001/api/channels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "My Channel",
    "youtubeUrl": "https://youtube.com/@mychannel",
    "targetPostingTime": "14:00"
  }'
```

### Get All Channels
```bash
curl http://localhost:3001/api/channels \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Storage Setup (Optional - for video uploads)

You can skip this initially and add it later when you need video uploads.

### Cloudflare R2 (Recommended - Free 10GB)
1. Sign up at cloudflare.com
2. Go to R2 → Create bucket
3. Generate API token
4. Add to `backend/.env`:
```env
S3_BUCKET=your-bucket-name
S3_REGION=auto
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret
S3_ENDPOINT=https://your-id.r2.cloudflarestorage.com
```

---

## Common Issues

**MongoDB not running?**
```bash
# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud) instead
```

**Port 3001 already in use?**
Change `PORT=3002` in `backend/.env`

**Can't connect to backend?**
Make sure both servers are running with `npm run dev`

---

## What's Built So Far

✅ User authentication (owner/editor roles)
✅ Channel management (CRUD)
✅ Inspiration channels (save model channels)
✅ Editor assignments
✅ Video upload system
✅ Video approval workflow
✅ Status tracking
✅ Timeline/history

🚧 Still to build:
- Deadline monitoring cron job
- Notifications system
- Full frontend UI
- Dashboard with status indicators

---

## Next Steps

1. Test the API endpoints above
2. Build out the frontend (or use the basic login page)
3. Add the deadline monitoring system
4. Deploy to Digital Ocean (see SETUP.md)

The backend is solid and ready to use!
