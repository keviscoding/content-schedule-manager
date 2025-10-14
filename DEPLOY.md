# 🚀 Deploy Real-Time YouTube Tracking

## Quick Deploy

```bash
# 1. Commit all changes
git add .
git commit -m "Add real-time YouTube upload tracking with live counters"

# 2. Push to your repository
git push origin main

# 3. Digital Ocean will auto-deploy!
```

## What Happens Next

1. **Digital Ocean detects the push**
2. **Pulls latest code**
3. **Installs dependencies**
4. **Builds frontend** (Vite)
5. **Starts backend** (Node.js)
6. **YouTube monitoring starts automatically**

## Verify Deployment

### Check Logs in Digital Ocean
Look for these messages:
```
✓ Connected to MongoDB
✓ Server running on port 3001
✓ Starting YouTube monitoring service...
✓ Running YouTube check...
✓ Updated channel: [Your Channel] - Last upload: X.Xh ago
```

### Test the Features

1. **Dashboard**
   - Open your app URL
   - Login
   - See channels with live counters
   - Watch counters update (wait 1 minute)

2. **Channel Detail**
   - Click on a channel
   - See time since upload
   - Click "Refresh" button
   - Counter should update immediately

3. **Status Colors**
   - 🟢 Green = Recent upload (< 36 hours)
   - 🟡 Yellow = Due soon (36-48 hours)
   - 🔴 Red = Overdue (> 48 hours)

## Environment Variables

Your YouTube API key is already set in Digital Ocean:
```
YOUTUBE_API_KEY=AIzaSyCRRF1CIXnyjre4OPqO8H...
```

No additional configuration needed! ✅

## Monitoring

### Check YouTube API Usage
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "APIs & Services" → "Dashboard"
3. Click "YouTube Data API v3"
4. View quota usage

### Expected Usage
- **Per channel per day**: ~192 units
- **10 channels**: ~1,920 units/day
- **50 channels**: ~9,600 units/day (near quota limit)

## Troubleshooting

### If monitoring doesn't start
```bash
# Check environment variables in Digital Ocean
# Make sure YOUTUBE_API_KEY is set

# Check logs for errors
# Look for "YouTube API key not configured" warning
```

### If counters don't update
1. Check browser console for errors
2. Verify backend is running
3. Check MongoDB connection
4. Wait up to 15 minutes for first check

### If status is wrong
1. Use manual refresh button
2. Check backend logs
3. Verify YouTube API key is valid
4. Check quota hasn't been exceeded

## Rollback (if needed)

```bash
# If something goes wrong, rollback to previous version
git revert HEAD
git push origin main
```

## Next Steps After Deployment

1. **Monitor for 24 hours** - Ensure cron job runs smoothly
2. **Check API quota** - Make sure you're within limits
3. **Gather feedback** - Ask editors if they find it useful
4. **Consider notifications** - Add email/Slack alerts next

## Support

If you encounter issues:
1. Check Digital Ocean logs
2. Verify YouTube API key
3. Check MongoDB connection
4. Review `REALTIME_TRACKING.md` for details

---

**Ready?** Just run the git commands above and you're live! 🎉
