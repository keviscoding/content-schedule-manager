# 🎬 NEW FEATURE: Video Task Assignments

## What's New

You can now assign video editing tasks to your editors! This creates a clear workflow for managing pending work.

## How It Works

### For Channel Owners:

1. **Create a task** for an editor
2. **(Optional)** Upload raw footage for them to edit
3. **Track progress** as they work
4. **Review** when they upload the finished video
5. **Approve/Reject** the final video

### For Editors:

1. **See your tasks** - All assignments in one place
2. **Mark in-progress** - Let the owner know you're working
3. **Download raw footage** (if provided)
4. **Upload finished video** when done
5. **Mark complete** - Link your video to the task

## Quick Example

```bash
# Owner creates task
curl -X POST http://localhost:3001/api/video-tasks \
  -H "Authorization: Bearer OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channelId": "CHANNEL_ID",
    "assignedToId": "EDITOR_ID",
    "title": "Edit gaming highlights",
    "instructions": "60 seconds, fast cuts, epic music",
    "dueDate": "2025-01-20T14:00:00Z"
  }'

# Editor sees task
curl http://localhost:3001/api/video-tasks \
  -H "Authorization: Bearer EDITOR_TOKEN"

# Editor marks in progress
curl -X PUT http://localhost:3001/api/video-tasks/TASK_ID/status \
  -H "Authorization: Bearer EDITOR_TOKEN" \
  -d '{"status":"in-progress"}'

# Editor uploads finished video
curl -X POST http://localhost:3001/api/videos/upload \
  -H "Authorization: Bearer EDITOR_TOKEN" \
  -d '{...video details...}'

# Editor completes task
curl -X POST http://localhost:3001/api/video-tasks/TASK_ID/complete \
  -H "Authorization: Bearer EDITOR_TOKEN" \
  -d '{"videoId":"VIDEO_ID"}'
```

## Test It Now

```bash
# Run the test script
./test-video-tasks.sh
```

This will:
- Create an owner and editor
- Create a channel
- Assign editor to channel
- Create a task
- Editor marks it in-progress
- Editor uploads video
- Editor completes task

## API Endpoints

All under `/api/video-tasks`:

- `POST /` - Create task (owner)
- `GET /` - List tasks (filtered by role)
- `GET /:id` - Get task details
- `PUT /:id/status` - Update status (editor)
- `POST /:id/complete` - Complete task (editor)
- `POST /:id/upload-raw` - Upload raw footage (owner)
- `DELETE /:id` - Delete task (owner)

## Task Statuses

- **pending** - Just created, waiting for editor
- **in-progress** - Editor is working on it
- **completed** - Editor uploaded finished video
- **cancelled** - Task was cancelled

## Benefits

### For Owners:
- ✅ Clear task assignments
- ✅ Track what editors are working on
- ✅ Set due dates
- ✅ Provide raw footage
- ✅ Give specific instructions

### For Editors:
- ✅ See all your pending work
- ✅ Know exactly what's expected
- ✅ Access raw footage easily
- ✅ Track your completed work
- ✅ Clear deadlines

## Use Cases

### 1. Simple Assignment
Owner: "Create a reaction video"
Editor: Works on it, uploads when done

### 2. Raw Footage Editing
Owner: Uploads 2-hour stream
Owner: "Cut to 60-second highlights"
Editor: Downloads, edits, uploads result

### 3. Batch Planning
Owner: Creates tasks for the whole week
Editor: Works through them one by one

## Complete Documentation

See **[VIDEO_TASKS_GUIDE.md](VIDEO_TASKS_GUIDE.md)** for:
- Complete API reference
- Response examples
- Integration with other features
- Tips for owners and editors
- Testing guide

## What's Next

This feature integrates with:
- ✅ Channel management
- ✅ Editor assignments
- ✅ Video approval workflow
- ✅ Deadline tracking

Coming soon:
- 🚧 Dashboard UI to see all tasks
- 🚧 Notifications when tasks are assigned/completed
- 🚧 Task comments/feedback

---

**Start using it now!** Create your first task and see how it streamlines your workflow.
