# Play Around With It NOW! 🎮

## Quick Setup (5 minutes)

### Option A: Use MongoDB Atlas (Easiest - No Install)

1. **Get Free MongoDB Database:**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up (free)
   - Create a free cluster (M0)
   - Click "Connect" → "Connect your application"
   - Copy the connection string

2. **Update Backend Config:**
   ```bash
   # Edit backend/.env
   # Replace the MONGODB_URI line with your Atlas connection string
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/content-schedule-manager
   ```

3. **Start the App:**
   ```bash
   npm run dev
   ```

4. **Open Browser:**
   - Go to http://localhost:5173
   - Register an account
   - Start playing!

### Option B: Install MongoDB Locally

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Start the app
npm run dev
```

---

## Test the API (Without UI)

If you just want to test the backend:

```bash
# Make sure backend is running
npm run dev:backend

# In another terminal, run tests
./test-api.sh              # Test basic features
./test-video-tasks.sh      # Test video task assignments (NEW!)
```

**test-api.sh** will:
- Register a test user
- Create a channel
- Add an inspiration channel
- Show you all the data

**test-video-tasks.sh** will:
- Create owner and editor accounts
- Assign editor to channel
- Create a video task
- Editor marks it in-progress
- Editor uploads and completes task

---

## Play Around With Features

### 1. Register Your Account

Open http://localhost:5173 and register with:
- Name: Your Name
- Email: test@example.com
- Password: password123

You'll get a token back - save it!

### 2. Create a Channel

```bash
# Replace YOUR_TOKEN with the token from step 1
curl -X POST http://localhost:3001/api/channels \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Gaming Channel",
    "youtubeUrl": "https://youtube.com/@mychannel",
    "targetPostingTime": "14:00"
  }'
```

Save the channel ID from the response!

### 3. Add Inspiration Channels

```bash
# Replace CHANNEL_ID and YOUR_TOKEN
curl -X POST http://localhost:3001/api/channels/CHANNEL_ID/inspiration-channels \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MrBeast",
    "youtubeUrl": "https://youtube.com/@MrBeast",
    "niche": "Entertainment",
    "notes": "Viral content, high production"
  }'
```

### 4. See All Your Channels

```bash
curl http://localhost:3001/api/channels \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. See Inspiration Channels

```bash
curl http://localhost:3001/api/channels/CHANNEL_ID/inspiration-channels \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Use Postman (Easier)

1. Download Postman: https://www.postman.com/downloads/
2. Import this collection:

**Register:**
- POST http://localhost:3001/api/auth/register
- Body (JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "owner"
  }
  ```

**Create Channel:**
- POST http://localhost:3001/api/channels
- Headers: `Authorization: Bearer YOUR_TOKEN`
- Body (JSON):
  ```json
  {
    "name": "My Channel",
    "youtubeUrl": "https://youtube.com/@me",
    "targetPostingTime": "14:00"
  }
  ```

**Add Inspiration Channel:**
- POST http://localhost:3001/api/channels/CHANNEL_ID/inspiration-channels
- Headers: `Authorization: Bearer YOUR_TOKEN`
- Body (JSON):
  ```json
  {
    "name": "Model Channel",
    "youtubeUrl": "https://youtube.com/@model",
    "niche": "Gaming",
    "notes": "Great editing style"
  }
  ```

---

## What You Can Test

✅ **User Management:**
- Register owners and editors
- Login/logout
- Get current user info

✅ **Channel Management:**
- Create channels with posting schedules
- Update channel details
- Delete channels
- View all your channels

✅ **Inspiration Channels:**
- Add model channels to each channel
- Store notes about what you like
- Quick reference for content ideas
- Remove inspiration channels

✅ **Editor Assignments:**
- Assign editors to channels
- Remove editor access
- View assigned editors

✅ **Video Management:**
- Upload videos (needs S3/R2 setup)
- Approve/reject videos
- Mark as posted
- View video history

✅ **Timeline:**
- View posting history
- See gaps in schedule
- Track on-time vs late posts

---

## Troubleshooting

**"Cannot connect to MongoDB"**
- Use MongoDB Atlas (Option A above)
- Or install MongoDB locally (Option B)

**"Port 3001 already in use"**
```bash
# Kill the process
lsof -ti:3001 | xargs kill

# Or change the port in backend/.env
PORT=3002
```

**"Module not found"**
```bash
# Reinstall dependencies
npm run install:all
```

**Backend won't start**
```bash
# Check the logs
npm run dev:backend
# Look for error messages
```

---

## Quick Commands

```bash
# Start everything
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Test the API
./test-api.sh

# Check if MongoDB is running
pgrep mongod

# View backend logs
# (Just look at the terminal where you ran npm run dev)
```

---

## Next Steps

Once you're playing around:

1. **Test all the features** using curl or Postman
2. **Check the data** in MongoDB Compass or Atlas UI
3. **Build the frontend** if you want a UI
4. **Deploy to Digital Ocean** when ready (see SETUP.md)

---

## Need Help?

- Backend not starting? Check MongoDB is running
- Can't create channels? Check your token is valid
- Want to see the data? Use MongoDB Compass
- Want a UI? The frontend needs to be built (see tasks.md)

**The backend is fully functional - have fun testing it!** 🚀
