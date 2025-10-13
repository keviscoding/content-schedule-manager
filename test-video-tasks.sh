#!/bin/bash

# Video Tasks Testing Script

API_URL="http://localhost:3001"

echo "🎬 Testing Video Task Assignment System"
echo "========================================"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq is not installed. Install it for better output:"
    echo "   brew install jq"
    echo ""
fi

# Register owner
echo "1️⃣  Registering owner..."
OWNER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@test.com","password":"pass123","name":"Channel Owner","role":"owner"}')

OWNER_TOKEN=$(echo "$OWNER_RESPONSE" | jq -r '.accessToken' 2>/dev/null || echo "")

if [ -z "$OWNER_TOKEN" ] || [ "$OWNER_TOKEN" = "null" ]; then
  echo "⚠️  Owner already exists, trying login..."
  OWNER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"owner@test.com","password":"pass123"}')
  OWNER_TOKEN=$(echo "$OWNER_RESPONSE" | jq -r '.accessToken' 2>/dev/null || echo "")
fi

echo "✅ Owner token: ${OWNER_TOKEN:0:20}..."

# Register editor
echo ""
echo "2️⃣  Registering editor..."
EDITOR_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"editor@test.com","password":"pass123","name":"Video Editor","role":"editor"}')

EDITOR_TOKEN=$(echo "$EDITOR_RESPONSE" | jq -r '.accessToken' 2>/dev/null || echo "")
EDITOR_ID=$(echo "$EDITOR_RESPONSE" | jq -r '.user.id' 2>/dev/null || echo "")

if [ -z "$EDITOR_TOKEN" ] || [ "$EDITOR_TOKEN" = "null" ]; then
  echo "⚠️  Editor already exists, trying login..."
  EDITOR_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"editor@test.com","password":"pass123"}')
  EDITOR_TOKEN=$(echo "$EDITOR_RESPONSE" | jq -r '.accessToken' 2>/dev/null || echo "")
  EDITOR_ID=$(echo "$EDITOR_RESPONSE" | jq -r '.user.id' 2>/dev/null || echo "")
fi

echo "✅ Editor token: ${EDITOR_TOKEN:0:20}..."
echo "✅ Editor ID: $EDITOR_ID"

# Create channel
echo ""
echo "3️⃣  Creating channel..."
CHANNEL_RESPONSE=$(curl -s -X POST "$API_URL/api/channels" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Channel","youtubeUrl":"https://youtube.com/@test","targetPostingTime":"14:00"}')

CHANNEL_ID=$(echo "$CHANNEL_RESPONSE" | jq -r '.channel._id' 2>/dev/null || echo "")
echo "✅ Channel ID: $CHANNEL_ID"

# Assign editor to channel
echo ""
echo "4️⃣  Assigning editor to channel..."
curl -s -X POST "$API_URL/api/channels/$CHANNEL_ID/editors" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"editorId\":\"$EDITOR_ID\"}" | jq '.' 2>/dev/null || echo "Assigned"

# Create video task
echo ""
echo "5️⃣  Creating video task..."
TASK_RESPONSE=$(curl -s -X POST "$API_URL/api/video-tasks" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"channelId\":\"$CHANNEL_ID\",
    \"assignedToId\":\"$EDITOR_ID\",
    \"title\":\"Edit gaming highlights\",
    \"description\":\"Create a 60-second highlight reel\",
    \"instructions\":\"Use fast cuts, add epic music, include best moments\",
    \"dueDate\":\"2025-01-20T14:00:00Z\"
  }")

echo "$TASK_RESPONSE" | jq '.' 2>/dev/null || echo "$TASK_RESPONSE"

TASK_ID=$(echo "$TASK_RESPONSE" | jq -r '.task._id' 2>/dev/null || echo "")
echo ""
echo "✅ Task ID: $TASK_ID"

# Editor views tasks
echo ""
echo "6️⃣  Editor viewing assigned tasks..."
curl -s "$API_URL/api/video-tasks" \
  -H "Authorization: Bearer $EDITOR_TOKEN" | jq '.' 2>/dev/null || echo "Tasks retrieved"

# Editor marks task in progress
echo ""
echo "7️⃣  Editor marking task as in-progress..."
curl -s -X PUT "$API_URL/api/video-tasks/$TASK_ID/status" \
  -H "Authorization: Bearer $EDITOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in-progress"}' | jq '.' 2>/dev/null || echo "Status updated"

# Editor uploads video
echo ""
echo "8️⃣  Editor uploading finished video..."
VIDEO_RESPONSE=$(curl -s -X POST "$API_URL/api/videos/upload" \
  -H "Authorization: Bearer $EDITOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"fileName\":\"finished-video.mp4\",
    \"fileType\":\"video/mp4\",
    \"fileSize\":50000000,
    \"title\":\"Gaming Highlights - Epic Moments\",
    \"description\":\"Best moments from the stream\",
    \"tags\":[\"gaming\",\"highlights\"],
    \"channelId\":\"$CHANNEL_ID\"
  }")

VIDEO_ID=$(echo "$VIDEO_RESPONSE" | jq -r '.video._id' 2>/dev/null || echo "")
echo "✅ Video ID: $VIDEO_ID"

# Editor completes task
echo ""
echo "9️⃣  Editor completing task..."
curl -s -X POST "$API_URL/api/video-tasks/$TASK_ID/complete" \
  -H "Authorization: Bearer $EDITOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"videoId\":\"$VIDEO_ID\"}" | jq '.' 2>/dev/null || echo "Task completed"

# Owner views completed task
echo ""
echo "🔟 Owner viewing completed task..."
curl -s "$API_URL/api/video-tasks/$TASK_ID" \
  -H "Authorization: Bearer $OWNER_TOKEN" | jq '.' 2>/dev/null || echo "Task retrieved"

echo ""
echo "✅ Video Task System Test Complete!"
echo ""
echo "📋 Summary:"
echo "  - Owner created task"
echo "  - Editor received task"
echo "  - Editor marked in-progress"
echo "  - Editor uploaded video"
echo "  - Editor completed task"
echo "  - Owner can now review"
echo ""
echo "🎯 Next: Owner can approve/reject the video"
echo "   curl -X POST $API_URL/api/videos/$VIDEO_ID/approve \\"
echo "     -H \"Authorization: Bearer $OWNER_TOKEN\""
