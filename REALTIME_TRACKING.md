# Real-Time YouTube Upload Tracking

## Overview
The system now automatically tracks time since last upload for each YouTube channel with real-time updates and visual indicators.

## Features

### 1. Automatic YouTube Monitoring
- **Background Service**: Checks all channels every 15 minutes
- **Initial Check**: Runs immediately when server starts
- **Data Stored**: Latest video date, title, and check timestamp saved to database

### 2. Real-Time Counter Component
- **Live Updates**: Counter updates every minute in the browser
- **Visual Status Indicators**:
  - 🟢 **Green (On-time)**: Less than 36 hours since last upload
  - 🟡 **Yellow (Due Soon)**: 36-48 hours since last upload
  - 🔴 **Red (Overdue)**: More than 48 hours since last upload

### 3. Channel Status
Channels are automatically categorized:
- **on-time**: Recent upload (< 36 hours)
- **due-soon**: Getting close to deadline (36-48 hours)
- **overdue**: Past deadline (> 48 hours)

### 4. Manual Refresh
- Refresh button on channel detail page
- Immediately fetches latest YouTube data
- Updates counter and status in real-time

## How It Works

### Backend
1. **YouTube Monitor Service** (`backend/src/services/youtubeMonitor.ts`)
   - Cron job runs every 15 minutes
   - Fetches latest video data from YouTube API v3
   - Updates channel status based on time since upload
   - Stores data in MongoDB

2. **Enhanced Channel Model**
   - `latestVideoDate`: Date of most recent upload
   - `latestVideoTitle`: Title of latest video
   - `lastYouTubeCheck`: When we last checked YouTube
   - `youtubeChannelId`: Cached channel ID for faster lookups

3. **Manual Refresh Endpoint**
   - `POST /api/channels/:id/refresh-youtube`
   - Immediately checks YouTube for updates
   - Available to both owners and assigned editors

### Frontend
1. **TimeSinceUpload Component** (`frontend/src/components/TimeSinceUpload.tsx`)
   - Updates every minute using `setInterval`
   - Shows color-coded status badge
   - Displays human-readable time (e.g., "2 hours ago")

2. **Dashboard Integration**
   - Shows counter on each channel card
   - Stats cards show overdue/due-soon counts
   - Auto-refreshes data every minute

3. **Channel Detail Integration**
   - Prominent counter display
   - Manual refresh button
   - Real-time task board updates

## Configuration

### Environment Variables
Make sure `YOUTUBE_API_KEY` is set in your Digital Ocean environment:
```
YOUTUBE_API_KEY=AIzaSyCRRF1CIXnyjre4OPqO8H...
```

### Customizing Thresholds
Edit `backend/src/services/youtubeMonitor.ts` to change when channels are marked as due-soon or overdue:

```typescript
// Current thresholds
if (hoursSinceUpload > 48) {
  channel.status = 'overdue';      // Change 48 to your preference
} else if (hoursSinceUpload > 36) {
  channel.status = 'due-soon';     // Change 36 to your preference
} else {
  channel.status = 'on-time';
}
```

### Changing Check Frequency
Edit the cron schedule in `backend/src/services/youtubeMonitor.ts`:

```typescript
// Current: every 15 minutes
cron.schedule('*/15 * * * *', () => { ... });

// Examples:
// Every 5 minutes:  '*/5 * * * *'
// Every 30 minutes: '*/30 * * * *'
// Every hour:       '0 * * * *'
```

## Usage

### For Owners
1. Add channels with YouTube URLs
2. System automatically tracks upload times
3. Dashboard shows which channels need attention
4. Click "Refresh" button for immediate updates

### For Editors
1. See assigned channels with upload status
2. Visual indicators show urgency
3. Task board shows pending work
4. Real-time updates keep you informed

## Benefits

✅ **No Manual Checking**: System monitors YouTube automatically
✅ **Real-Time Awareness**: Always know which channels need content
✅ **Visual Indicators**: Quickly identify overdue channels
✅ **Editor Visibility**: Editors see deadlines for their channels
✅ **Accurate Tracking**: Uses official YouTube API data
✅ **Low API Usage**: Checks every 15 minutes (96 requests/day per channel)

## API Quota
YouTube API v3 has a daily quota of 10,000 units:
- Channel info: 1 unit
- Playlist items: 1 unit
- Total per check: ~2 units

With 15-minute intervals:
- Checks per day: 96
- Units per channel per day: ~192
- Max channels with default quota: ~50 channels

If you need more channels, request a quota increase from Google.

## Troubleshooting

### Counter not updating
- Check browser console for errors
- Verify `YOUTUBE_API_KEY` is set in Digital Ocean
- Check backend logs for YouTube API errors

### Status not changing
- Wait for next cron cycle (up to 15 minutes)
- Use manual refresh button
- Check MongoDB for `lastYouTubeCheck` timestamp

### YouTube API errors
- Verify API key is valid
- Check quota hasn't been exceeded
- Ensure YouTube Data API v3 is enabled in Google Cloud Console

## Next Steps

Consider adding:
- Email notifications when channels go overdue
- Slack/Discord webhooks for alerts
- Custom thresholds per channel
- Historical tracking of upload patterns
- Predictive alerts based on typical schedule
