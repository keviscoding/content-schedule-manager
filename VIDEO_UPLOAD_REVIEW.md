# Video Upload & Review System

## Overview
Complete video workflow from upload to approval to posting, with a beautiful drag-and-drop interface and video player.

## Features

### 1. Video Upload Interface
**For Editors & Owners**

- **Drag & Drop Upload**: Beautiful dropzone with visual feedback
- **File Validation**: Accepts MP4, MOV, AVI, MKV (max 500MB)
- **Progress Tracking**: Real-time upload progress bar
- **Metadata Entry**: Title, description, and tags
- **Task Linking**: Automatically link uploaded videos to tasks
- **Direct Upload to S3/R2**: Uses presigned URLs for secure uploads

**Access**: `/upload?channelId=xxx&taskId=xxx`

### 2. Video Review Page
**For Owners Only**

- **Pending Queue**: See all videos awaiting review
- **Video Player**: Watch videos directly in the app
- **Quick Actions**: Approve or reject with one click
- **Rejection Notes**: Provide feedback to editors
- **Status Tracking**: Filter by pending, approved, rejected, posted
- **Stats Dashboard**: See pending and approved counts

**Access**: `/review`

### 3. Video Player Component
- **HTML5 Video Player**: Native browser controls
- **Responsive Design**: Works on all screen sizes
- **Preload Metadata**: Fast loading
- **Multiple Formats**: Supports all common video formats

### 4. Integrated Workflow
- **Upload from Tasks**: Direct upload button on task cards
- **Upload from Channel**: Upload button on channel detail page
- **Review from Dashboard**: Quick access to review queue
- **Status Updates**: Automatic status tracking (pending → approved → posted)

## User Flows

### Editor Workflow
```
1. View assigned task on channel page
2. Click "Upload" button on task card
3. Drag & drop video file
4. Enter title, description, tags
5. Click "Upload Video"
6. Video automatically linked to task
7. Task marked as completed
8. Wait for owner approval
```

### Owner Workflow
```
1. Click "Review Videos" on dashboard
2. See all pending videos
3. Click video to open review modal
4. Watch video in player
5. Either:
   - Approve → Video ready to post
   - Reject → Add notes for editor
6. Approved videos can be marked as "Posted"
7. Posted videos update channel's last posted time
```

## UI Components

### VideoUpload Component
**Location**: `frontend/src/components/VideoUpload.tsx`

**Props**:
- `channelId` (required): Channel to upload to
- `taskId` (optional): Task to link video to
- `onUploadComplete` (optional): Callback after successful upload

**Features**:
- Drag & drop zone with visual states
- File size validation
- Upload progress tracking
- Metadata form
- Error handling

### VideoPlayer Component
**Location**: `frontend/src/components/VideoPlayer.tsx`

**Props**:
- `videoUrl` (required): URL of video file
- `title` (required): Video title
- `className` (optional): Additional CSS classes

**Features**:
- HTML5 video player
- Native controls
- Responsive design
- Black background for cinematic feel

## Pages

### Video Upload Page
**Route**: `/upload`
**File**: `frontend/src/pages/VideoUploadPage.tsx`

**Query Params**:
- `channelId`: Required - Channel to upload to
- `taskId`: Optional - Task to link video to

**Features**:
- Channel info display
- Task info display (if linked)
- Full upload interface
- Back navigation

### Video Review Page
**Route**: `/review`
**File**: `frontend/src/pages/VideoReviewPage.tsx`

**Access**: Owners only

**Features**:
- Pending/All filter tabs
- Video grid with thumbnails
- Stats cards (pending, approved counts)
- Review modal with video player
- Approve/Reject actions
- Mark as Posted action
- Rejection notes

## Backend Integration

### Upload Flow
1. **POST /api/videos/upload**
   - Validates file size and channel access
   - Generates presigned S3/R2 URL
   - Creates video record in database
   - Returns upload URL and video ID

2. **Client uploads to S3/R2**
   - Direct upload using presigned URL
   - Progress tracking via XMLHttpRequest
   - No backend involvement

3. **POST /api/video-tasks/:id/complete** (if task linked)
   - Links video to task
   - Marks task as completed
   - Updates task status

### Review Flow
1. **GET /api/videos?status=pending**
   - Fetches videos for review
   - Filtered by owner's channels
   - Returns video metadata

2. **POST /api/videos/:id/approve**
   - Changes status to "approved"
   - Creates status history entry
   - Owner only

3. **POST /api/videos/:id/reject**
   - Changes status to "rejected"
   - Saves rejection notes
   - Creates status history entry
   - Owner only

4. **POST /api/videos/:id/mark-posted**
   - Changes status to "posted"
   - Updates channel's last posted time
   - Calculates next deadline
   - Owner only

## Status Workflow

```
pending → approved → posted
   ↓
rejected → (editor re-uploads)
```

**Status Meanings**:
- `pending`: Awaiting owner review
- `approved`: Ready to be posted
- `rejected`: Needs changes (editor can see rejection notes)
- `posted`: Published to YouTube
- `needs-revision`: (future) Needs minor changes

## Storage

Videos are stored in S3/R2 using presigned URLs:
- **Path**: `videos/{timestamp}-{filename}`
- **Max Size**: 500MB
- **Formats**: MP4, MOV, AVI, MKV
- **Access**: Private (presigned URLs for viewing)

## Security

- **Channel Access**: Editors can only upload to assigned channels
- **Owner Actions**: Only owners can approve/reject/mark-posted
- **File Validation**: Size and type checked on backend
- **Presigned URLs**: Temporary, secure upload links
- **Authentication**: All endpoints require JWT token

## UI/UX Highlights

### Upload Interface
- ✅ Beautiful drag & drop zone
- ✅ Visual feedback (drag active, file selected)
- ✅ Real-time progress bar
- ✅ File size display
- ✅ Remove file option
- ✅ Disabled state during upload
- ✅ Success feedback

### Review Interface
- ✅ Grid layout with thumbnails
- ✅ Status badges with colors
- ✅ Hover effects
- ✅ Modal video player
- ✅ Quick approve/reject buttons
- ✅ Rejection notes textarea
- ✅ Stats dashboard
- ✅ Filter tabs

### Integration Points
- ✅ Upload button on channel page
- ✅ Upload button on task cards
- ✅ Review button on dashboard
- ✅ Task auto-completion
- ✅ Channel last posted update

## Customization

### Change Max File Size
Edit `backend/src/routes/videos.ts`:
```typescript
// Current: 500MB
if (fileSize > 500 * 1024 * 1024) {
  // Change to 1GB:
  if (fileSize > 1024 * 1024 * 1024) {
```

### Add More Video Formats
Edit `frontend/src/components/VideoUpload.tsx`:
```typescript
accept: {
  'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv'],
}
```

### Customize Upload Progress
Edit `frontend/src/components/VideoUpload.tsx`:
```typescript
// Change progress bar color
className="bg-gradient-to-r from-purple-600 to-pink-600"
// Change to blue:
className="bg-gradient-to-r from-blue-600 to-indigo-600"
```

## Testing

### Test Upload
1. Login as editor
2. Go to channel detail page
3. Click "Upload Video" button
4. Drag & drop a video file
5. Fill in title and description
6. Click "Upload Video"
7. Watch progress bar
8. Verify redirect to channel page

### Test Review
1. Login as owner
2. Click "Review Videos" on dashboard
3. See pending videos
4. Click a video to open modal
5. Watch video in player
6. Click "Approve" or "Reject"
7. Verify status update

### Test Task Linking
1. Create a task for an editor
2. Editor clicks "Upload" on task card
3. Upload video
4. Verify task is marked as completed
5. Verify video is linked to task

## Troubleshooting

### Upload fails
- Check S3/R2 credentials in backend `.env`
- Verify presigned URL generation
- Check file size (max 500MB)
- Check network connection

### Video doesn't play
- Verify video format is supported
- Check S3/R2 CORS settings
- Verify presigned URL is valid
- Check browser console for errors

### Can't approve/reject
- Verify user is owner
- Check channel ownership
- Verify video exists
- Check backend logs

## Next Steps

Consider adding:
- **Thumbnail Generation**: Auto-generate thumbnails from videos
- **Video Trimming**: Edit videos in the browser
- **Batch Operations**: Approve/reject multiple videos
- **Comments**: Add comments to videos
- **Version History**: Track video revisions
- **Analytics**: Track view counts, engagement

---

**Status**: ✅ Ready to use!

The video upload and review system is fully functional and integrated into your workflow. Editors can upload videos, owners can review them, and everything is tracked automatically.
