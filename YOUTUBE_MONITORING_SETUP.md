# YouTube Real-Time Monitoring Setup

## ✅ What's Been Implemented

Your content management system now has **real-time YouTube upload tracking**! Here's what's working:

### Features
1. **Automatic Monitoring** - Checks YouTube every 15 minutes for new uploads
2. **Real-Time Counter** - Shows time since last upload, updates every minute
3. **Visual Status Indicators**:
   - 🟢 Green = On-time (< 36 hours)
   - 🟡 Yellow = Due soon (36-48 hours)  
   - 🔴 Red = Overdue (> 48 hours)
4. **Manual Refresh** - Button to immediately check YouTube
5. **Dashboard Stats** - See overdue/due-soon counts at a glance

## 🚀 How to Deploy

### 1. Your YouTube API Key is Already Set
I can see from your Digital Ocean screenshot that you have:
```
YOUTUBE_API_KEY=AIzaSyCRRF1CIXnyjre4OPqO8H...
```

This is already configured! ✅

### 2. Deploy the Updated Code

```bash
# On your local machine
git add .
git commit -m "Add real-time YouTube upload tracking"
git push origin main
```

### 3. Digital Ocean Will Auto-Deploy
If you have auto-deploy enabled, Digital Ocean will:
1. Pull the latest code
2. Build the backend and frontend
3. Restart the server
4. Start the YouTube monitoring service

### 4. Verify It's Working

After deployment, check the logs:
```bash
# You should see these messages:
✓ Connected to MongoDB
✓ Server running on port 3001
✓ Starting YouTube monitoring service...
✓ Running YouTube check...
✓ Updated channel: [Channel Name] - Last upload: 12.5h ago
```

## 📊 What You'll See

### Dashboard
- Each channel card shows a live counter
- Color-coded badges indicate status
- Stats at top show overdue/due-soon counts
- Auto-refreshes every minute

### Channel Detail Page
- Prominent time-since-upload counter
- "Refresh" button for immediate updates
- Task board with deadline tracking

## ⚙️ Customization

### Change Check Frequency
Edit `backend/src/services/youtubeMonitor.ts`:

```typescript
// Current: every 15 minutes
cron.schedule('*/15 * * * *', () => { ... });

// Change to every 5 minutes:
cron.schedule('*/5 * * * *', () => { ... });
```

### Adjust Status Thresholds
Edit the same file:

```typescript
// Current thresholds
if (hoursSinceUpload > 48) {
  channel.status = 'overdue';      // Change 48 to your preference
} else if (hoursSinceUpload > 36) {
  channel.status = 'due-soon';     // Change 36 to your preference
}
```

### Change Counter Update Frequency
Edit `frontend/src/components/TimeSinceUpload.tsx`:

```typescript
// Current: updates every minute (60000ms)
const interval = setInterval(updateTime, 60000);

// Change to every 30 seconds:
const interval = setInterval(updateTime, 30000);
```

## 🔍 Testing Locally

Before deploying, test locally:

```bash
# 1. Make sure MongoDB is running
# 2. Set your YouTube API key in backend/.env
echo "YOUTUBE_API_KEY=AIzaSyCRRF1CIXnyjre4OPqO8H..." >> backend/.env

# 3. Start the app
npm run dev

# 4. Check the console - you should see:
# "Starting YouTube monitoring service..."
# "Running YouTube check..."
# "Updated channel: ..."
```

## 📱 Usage

### For Owners
1. Add your YouTube channels
2. System automatically tracks upload times
3. Dashboard shows which channels need attention
4. Click "Refresh" for immediate updates

### For Editors  
1. See assigned channels with status
2. Visual indicators show urgency
3. Know which channels need content ASAP

## 🎯 Next Steps

Now that real-time tracking is working, you might want to add:

1. **Email Notifications** - Alert when channels go overdue
2. **Slack/Discord Webhooks** - Team notifications
3. **Video Upload UI** - Let editors upload directly
4. **Approval Workflow UI** - Review and approve videos
5. **Analytics Dashboard** - Track upload patterns over time

See `REALTIME_TRACKING.md` for detailed technical documentation.

## 🐛 Troubleshooting

### Counter not updating
- Check browser console for errors
- Verify YouTube API key is set
- Check backend logs

### "YouTube API key not configured" warning
- Make sure `YOUTUBE_API_KEY` is set in Digital Ocean environment variables
- Restart the server after adding the key

### Status not changing
- Wait up to 15 minutes for next check
- Use manual refresh button
- Check backend logs for errors

### YouTube API quota exceeded
- Default quota: 10,000 units/day
- Each check uses ~2 units
- With 15-min intervals: ~192 units/channel/day
- Max ~50 channels with default quota
- Request quota increase from Google if needed

## 📞 Support

If you run into issues:
1. Check backend logs in Digital Ocean
2. Verify YouTube API key is valid
3. Ensure YouTube Data API v3 is enabled in Google Cloud Console
4. Check MongoDB connection

---

**Ready to deploy?** Just push to git and Digital Ocean will handle the rest! 🚀
