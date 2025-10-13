# How to Use Content Schedule Manager

## For Local Development

### Step 1: Start the App

```bash
# Make sure MongoDB is running first!
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Then start the app
npm run dev
```

You'll see:
- Backend running on http://localhost:3001
- Frontend running on http://localhost:5173

### Step 2: Register Your Account

1. Open http://localhost:5173
2. Click "Register"
3. Fill in:
   - Name: Your Name
   - Email: your@email.com
   - Password: (anything)
4. Click "Register"

You're now logged in as an owner!

### Step 3: Use the API

The frontend is minimal right now, so use the API directly:

#### Create Your First Channel

```bash
# Replace YOUR_TOKEN with the token from registration
curl -X POST http://localhost:3001/api/channels \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Gaming Channel",
    "youtubeUrl": "https://youtube.com/@mychannel",
    "targetPostingTime": "14:00"
  }'
```

#### Add an Inspiration Channel

```bash
# Replace CHANNEL_ID with your channel's ID
curl -X POST http://localhost:3001/api/channels/CHANNEL_ID/inspiration-channels \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MrBeast",
    "youtubeUrl": "https://youtube.com/@MrBeast",
    "niche": "Entertainment",
    "notes": "High production value, viral content"
  }'
```

#### Get All Your Channels

```bash
curl http://localhost:3001/api/channels \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Mark a Video as Posted

```bash
# This updates the channel's last posted time
curl -X POST http://localhost:3001/api/videos/VIDEO_ID/mark-posted \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 4: Test Everything

Run the test script:

```bash
./test-api.sh
```

This will:
- Register a test user
- Create a channel
- Add an inspiration channel
- Show you all the data

---

## For Production (Digital Ocean)

### Option 1: App Platform (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Create App on Digital Ocean**
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Connect your GitHub repo
   - Select your repository

3. **Configure Backend**
   - Name: `content-schedule-backend`
   - Source Directory: `/backend`
   - Build Command: `npm install && npm run build`
   - Run Command: `npm start`
   - Environment Variables:
     ```
     MONGODB_URI=your-mongodb-atlas-uri
     JWT_SECRET=random-secret-key
     JWT_REFRESH_SECRET=another-random-key
     FRONTEND_URL=https://your-frontend-url
     S3_BUCKET=your-bucket
     S3_REGION=your-region
     S3_ACCESS_KEY=your-key
     S3_SECRET_KEY=your-secret
     ```

4. **Configure Frontend**
   - Name: `content-schedule-frontend`
   - Source Directory: `/frontend`
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=https://your-backend-url
     ```

5. **Deploy!**
   - Click "Create Resources"
   - Wait for deployment
   - Your app is live!

### Option 2: Droplet (More Control)

See [SETUP.md](SETUP.md) for complete droplet setup instructions.

Quick version:
```bash
# On your droplet
git clone your-repo
cd content-schedule-manager
npm run install:all

# Setup environment
cd backend
nano .env  # Add your production config

# Build and start
npm run build
pm2 start dist/index.js --name content-schedule-api

# Setup Nginx (see SETUP.md for config)
```

---

## Using the App

### As a Channel Owner

1. **Add Channels**
   - POST to `/api/channels`
   - Include name, YouTube URL, target posting time

2. **Add Inspiration Channels**
   - POST to `/api/channels/:id/inspiration-channels`
   - Save model channels you're copying

3. **Invite Editors**
   - Have them register with role "editor"
   - POST to `/api/channels/:id/editors` with their user ID

4. **Review Videos**
   - GET `/api/videos?channelId=CHANNEL_ID&status=pending`
   - POST to `/api/videos/:id/approve` or `/api/videos/:id/reject`

5. **Mark Videos as Posted**
   - POST to `/api/videos/:id/mark-posted`
   - This resets the deadline timer

### As an Editor

1. **Upload Videos**
   - POST to `/api/videos/upload`
   - Get presigned URL
   - Upload directly to S3/R2

2. **Check Status**
   - GET `/api/videos?status=pending`
   - See if your videos are approved

---

## Monitoring Deadlines

Currently, you need to manually check:

```bash
# Get all channels with their status
curl http://localhost:3001/api/channels \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Look for:
- `lastPostedAt` - When you last posted
- `nextDeadline` - When you need to post next
- `status` - "on-time", "due-soon", or "overdue"

**Coming Soon:** Automatic monitoring with notifications!

---

## Storage Setup

### For Video Uploads

You need S3, R2, or Spaces configured:

**Cloudflare R2 (Recommended - Free 10GB):**
1. Sign up at cloudflare.com
2. Go to R2 → Create bucket
3. Generate API token
4. Add to `.env`:
   ```env
   S3_BUCKET=your-bucket-name
   S3_REGION=auto
   S3_ACCESS_KEY=your-key
   S3_SECRET_KEY=your-secret
   S3_ENDPOINT=https://your-id.r2.cloudflarestorage.com
   ```

**AWS S3:**
```env
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY=your-aws-key
S3_SECRET_KEY=your-aws-secret
# No endpoint needed
```

**Digital Ocean Spaces:**
```env
S3_BUCKET=your-space-name
S3_REGION=nyc3
S3_ACCESS_KEY=your-spaces-key
S3_SECRET_KEY=your-spaces-secret
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
```

---

## Database Options

### Local MongoDB
```bash
# Mac
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install mongodb
sudo systemctl start mongod
```

### MongoDB Atlas (Cloud - Recommended for Production)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP (0.0.0.0/0 for all)
5. Get connection string
6. Update `MONGODB_URI` in `.env`

---

## Troubleshooting

**"Cannot connect to MongoDB"**
- Make sure MongoDB is running
- Check your `MONGODB_URI` is correct
- For Atlas, check IP whitelist

**"Cannot upload videos"**
- Check S3/R2 credentials
- Verify bucket exists
- Check bucket permissions

**"Token expired"**
- Use the refresh endpoint: POST `/api/auth/refresh`
- Or login again

**"Port already in use"**
- Change `PORT` in `backend/.env`
- Or kill the process: `lsof -ti:3001 | xargs kill`

---

## Next Steps

1. **Test the APIs** - Use curl or Postman
2. **Build the Frontend** - Follow tasks in `tasks.md`
3. **Add Monitoring** - Implement the cron job (Task 6)
4. **Deploy** - Put it on Digital Ocean
5. **Use It!** - Start tracking your channels

---

## Need Help?

- Check [QUICKSTART.md](QUICKSTART.md) for quick setup
- Check [SETUP.md](SETUP.md) for detailed instructions
- Check [PROJECT_STATUS.md](PROJECT_STATUS.md) for what's built
- Run `./test-api.sh` to test everything

The backend is solid and ready to use! 🚀
