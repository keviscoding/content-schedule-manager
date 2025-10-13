#!/bin/bash

echo "🎉 Testing Your Account"
echo "======================"
echo ""

# Prompt for credentials
read -p "Enter your email: " EMAIL
read -sp "Enter your password: " PASSWORD
echo ""
echo ""

API_URL="http://localhost:3001"

# Login
echo "1️⃣  Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken' 2>/dev/null || echo "")

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Login failed"
  echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Logged in successfully!"
echo "Token: ${TOKEN:0:30}..."
echo ""

# Get user info
echo "2️⃣  Getting your user info..."
curl -s "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.' 2>/dev/null
echo ""

# Create a channel
echo "3️⃣  Creating a test channel..."
CHANNEL_RESPONSE=$(curl -s -X POST "$API_URL/api/channels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Channel",
    "youtubeUrl": "https://youtube.com/@mychannel",
    "targetPostingTime": "14:00"
  }')

echo "$CHANNEL_RESPONSE" | jq '.' 2>/dev/null || echo "$CHANNEL_RESPONSE"

CHANNEL_ID=$(echo "$CHANNEL_RESPONSE" | jq -r '.channel._id' 2>/dev/null || echo "")
echo ""

if [ -n "$CHANNEL_ID" ] && [ "$CHANNEL_ID" != "null" ]; then
  # Add inspiration channel
  echo "4️⃣  Adding an inspiration channel..."
  curl -s -X POST "$API_URL/api/channels/$CHANNEL_ID/inspiration-channels" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "MrBeast",
      "youtubeUrl": "https://youtube.com/@MrBeast",
      "niche": "Entertainment",
      "notes": "High production value, viral content"
    }' | jq '.' 2>/dev/null
  echo ""
fi

# Get all channels
echo "5️⃣  Getting all your channels..."
curl -s "$API_URL/api/channels" \
  -H "Authorization: Bearer $TOKEN" | jq '.' 2>/dev/null
echo ""

echo "✅ All done!"
echo ""
echo "📝 Your token (save this for API calls):"
echo "$TOKEN"
echo ""
echo "🎯 Next steps:"
echo "  - Use this token for API calls"
echo "  - See VIDEO_TASKS_GUIDE.md for task management"
echo "  - See HOW_TO_USE.md for all features"
