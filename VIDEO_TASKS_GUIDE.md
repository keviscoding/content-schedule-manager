# Video Task Assignment System

## Overview

This feature lets you assign video editing tasks to your editors. You can upload raw footage, give instructions, and editors can mark tasks complete when they upload the finished video.

## Workflow

```
Owner → Creates Task → Assigns to Editor → (Optional) Uploads Raw Video
                                ↓
Editor → Sees Task → Marks "In Progress" → Edits Video
                                ↓
Editor → Uploads Finished Video → Marks Task Complete
                                ↓
Owner → Reviews Video → Approves/Rejects
```

## API Endpoints

### 1. Create a Task (Owner)

Assign a video editing task to an editor:

```bash
curl -X POST http://localhost:3001/api/video-tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channelId": "CHANNEL_ID",
    "assignedToId": "EDITOR_USER_ID",
    "title": "Edit gaming highlights video",
    "description": "Create a 60-second highlight reel",
    "instructions": "Use fast cuts, add epic music, include the best kills",
    "dueDate": "2025-01-20T14:00:00Z"
  }'
```

### 2. Upload Raw Video (Owner)

Upload the raw footage for the editor to work with:

```bash
# Step 1: Get presigned URL
curl -X POST http://localhost:3001/api/video-tasks/TASK_ID/upload-raw \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "raw-footage.mp4",
    "fileType": "video/mp4"
  }'

# Step 2: Upload to the presigned URL (use the URL from step 1)
curl -X PUT "PRESIGNED_URL" \
  -H "Content-Type: video/mp4" \
  --upload-file raw-footage.mp4
```

### 3. Get All Tasks

**For Owners** (see all tasks for your channels):
```bash
curl http://localhost:3001/api/video-tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**For Editors** (see tasks assigned to you):
```bash
curl http://localhost:3001/api/video-tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Filter by status:
```bash
curl "http://localhost:3001/api/video-tasks?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Filter by channel:
```bash
curl "http://localhost:3001/api/video-tasks?channelId=CHANNEL_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get Task Details

```bash
curl http://localhost:3001/api/video-tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Mark Task In Progress (Editor)

```bash
curl -X PUT http://localhost:3001/api/video-tasks/TASK_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'
```

### 6. Upload Finished Video (Editor)

First, upload the video normally:

```bash
# Step 1: Initiate video upload
curl -X POST http://localhost:3001/api/videos/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "finished-video.mp4",
    "fileType": "video/mp4",
    "fileSize": 50000000,
    "title": "Gaming Highlights - Epic Kills",
    "description": "Best moments from last stream",
    "tags": ["gaming", "highlights"],
    "channelId": "CHANNEL_ID"
  }'

# Step 2: Upload to presigned URL (from step 1)
curl -X PUT "PRESIGNED_URL" \
  -H "Content-Type: video/mp4" \
  --upload-file finished-video.mp4
```

### 7. Complete Task (Editor)

Link the uploaded video to the task:

```bash
curl -X POST http://localhost:3001/api/video-tasks/TASK_ID/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"videoId": "VIDEO_ID"}'
```

### 8. Delete Task (Owner)

```bash
curl -X DELETE http://localhost:3001/api/video-tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Task Statuses

- **pending** - Task created, waiting for editor to start
- **in-progress** - Editor is working on it
- **completed** - Editor uploaded finished video
- **cancelled** - Task was cancelled

## Use Cases

### Use Case 1: Simple Task Assignment

Owner creates task without raw video (editor has their own footage):

```bash
# Owner creates task
POST /api/video-tasks
{
  "channelId": "...",
  "assignedToId": "...",
  "title": "Create reaction video",
  "instructions": "React to the latest trending video"
}

# Editor uploads finished video
POST /api/videos/upload
# ... upload video ...

# Editor marks task complete
POST /api/video-tasks/TASK_ID/complete
{"videoId": "..."}
```

### Use Case 2: Raw Footage Editing

Owner provides raw footage for editor to edit:

```bash
# Owner creates task
POST /api/video-tasks
{
  "channelId": "...",
  "assignedToId": "...",
  "title": "Edit stream highlights",
  "instructions": "Cut to 60 seconds, add music"
}

# Owner uploads raw footage
POST /api/video-tasks/TASK_ID/upload-raw
# ... upload raw video ...

# Editor downloads raw video, edits it
# Editor uploads finished video
POST /api/videos/upload
# ... upload edited video ...

# Editor marks task complete
POST /api/video-tasks/TASK_ID/complete
{"videoId": "..."}
```

### Use Case 3: Batch Task Management

Owner creates multiple tasks for the week:

```bash
# Create Monday task
POST /api/video-tasks
{"title": "Monday video", "dueDate": "2025-01-13T14:00:00Z"}

# Create Tuesday task
POST /api/video-tasks
{"title": "Tuesday video", "dueDate": "2025-01-14T14:00:00Z"}

# Editor sees all pending tasks
GET /api/video-tasks?status=pending

# Editor works through them one by one
```

## Response Examples

### Task Object

```json
{
  "task": {
    "_id": "task123",
    "channelId": {
      "_id": "channel123",
      "name": "My Gaming Channel"
    },
    "assignedToId": {
      "_id": "user123",
      "name": "John Editor",
      "email": "john@example.com"
    },
    "assignedById": {
      "_id": "user456",
      "name": "Channel Owner",
      "email": "owner@example.com"
    },
    "title": "Edit gaming highlights",
    "description": "Create 60-second highlight reel",
    "instructions": "Fast cuts, epic music, best kills",
    "rawVideoUrl": "https://storage.com/raw-videos/123.mp4",
    "dueDate": "2025-01-20T14:00:00Z",
    "status": "in-progress",
    "completedVideoId": null,
    "completedAt": null,
    "createdAt": "2025-01-10T10:00:00Z",
    "updatedAt": "2025-01-10T11:00:00Z"
  }
}
```

### Task List

```json
{
  "tasks": [
    {
      "_id": "task123",
      "title": "Edit gaming highlights",
      "status": "in-progress",
      "dueDate": "2025-01-20T14:00:00Z",
      "channelId": {
        "name": "My Gaming Channel"
      },
      "assignedToId": {
        "name": "John Editor"
      }
    },
    {
      "_id": "task124",
      "title": "Create reaction video",
      "status": "pending",
      "dueDate": "2025-01-21T14:00:00Z",
      "channelId": {
        "name": "My Gaming Channel"
      },
      "assignedToId": {
        "name": "Jane Editor"
      }
    }
  ]
}
```

## Integration with Existing Features

### With Video Approval Workflow

1. Editor completes task → uploads video (status: pending)
2. Owner reviews video → approves/rejects
3. If approved → owner marks as posted
4. Task remains completed regardless of video approval

### With Channel Management

- Tasks are tied to channels
- Only editors assigned to a channel can receive tasks for that channel
- Owners see all tasks for their channels

### With Deadline Tracking

- Tasks have their own due dates
- Separate from channel posting deadlines
- Helps manage editor workload

## Tips

### For Owners:

1. **Be specific in instructions** - The more detail, the better the result
2. **Set realistic due dates** - Give editors enough time
3. **Upload raw footage early** - Don't block editors
4. **Review completed videos promptly** - Keep the workflow moving

### For Editors:

1. **Mark tasks in-progress** - Let the owner know you're working on it
2. **Download raw footage immediately** - Don't wait until the last minute
3. **Complete tasks on time** - Build trust with the owner
4. **Add good metadata** - Title, description, tags when uploading

## Testing

Test the complete workflow:

```bash
# 1. Owner creates task
curl -X POST http://localhost:3001/api/video-tasks \
  -H "Authorization: Bearer OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channelId": "CHANNEL_ID",
    "assignedToId": "EDITOR_ID",
    "title": "Test task",
    "instructions": "Test instructions"
  }'

# 2. Editor sees task
curl http://localhost:3001/api/video-tasks \
  -H "Authorization: Bearer EDITOR_TOKEN"

# 3. Editor marks in progress
curl -X PUT http://localhost:3001/api/video-tasks/TASK_ID/status \
  -H "Authorization: Bearer EDITOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'

# 4. Editor uploads video
curl -X POST http://localhost:3001/api/videos/upload \
  -H "Authorization: Bearer EDITOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.mp4",
    "fileType": "video/mp4",
    "fileSize": 1000000,
    "title": "Test video",
    "channelId": "CHANNEL_ID"
  }'

# 5. Editor completes task
curl -X POST http://localhost:3001/api/video-tasks/TASK_ID/complete \
  -H "Authorization: Bearer EDITOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"videoId": "VIDEO_ID"}'

# 6. Owner reviews
curl http://localhost:3001/api/video-tasks/TASK_ID \
  -H "Authorization: Bearer OWNER_TOKEN"
```

---

**This feature is now live!** Start assigning tasks to your editors.
