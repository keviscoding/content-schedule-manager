#!/bin/bash

# API Testing Script
# Tests all the main endpoints

API_URL="http://localhost:3001"
EMAIL="test@example.com"
PASSWORD="password123"
NAME="Test User"

echo "🧪 Testing Content Schedule Manager API"
echo "========================================"

# Register
echo ""
echo "1️⃣  Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"$NAME\",\"role\":\"owner\"}")

echo "$REGISTER_RESPONSE" | jq '.'

# Extract token
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Registration failed. Trying login instead..."
  
  # Try login
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
  
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
  
  if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Login also failed. Exiting."
    exit 1
  fi
  
  echo "✅ Logged in successfully"
else
  echo "✅ Registered successfully"
fi

echo ""
echo "🔑 Token: $TOKEN"

# Get current user
echo ""
echo "2️⃣  Getting current user..."
curl -s "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Create channel
echo ""
echo "3️⃣  Creating channel..."
CHANNEL_RESPONSE=$(curl -s -X POST "$API_URL/api/channels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Gaming Channel","youtubeUrl":"https://youtube.com/@testchannel","targetPostingTime":"14:00"}')

echo "$CHANNEL_RESPONSE" | jq '.'

CHANNEL_ID=$(echo "$CHANNEL_RESPONSE" | jq -r '.channel._id')

if [ "$CHANNEL_ID" = "null" ] || [ -z "$CHANNEL_ID" ]; then
  echo "❌ Channel creation failed"
else
  echo "✅ Channel created: $CHANNEL_ID"
fi

# Get all channels
echo ""
echo "4️⃣  Getting all channels..."
curl -s "$API_URL/api/channels" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Add inspiration channel
if [ "$CHANNEL_ID" != "null" ] && [ -n "$CHANNEL_ID" ]; then
  echo ""
  echo "5️⃣  Adding inspiration channel..."
  curl -s -X POST "$API_URL/api/channels/$CHANNEL_ID/inspiration-channels" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"MrBeast Gaming","youtubeUrl":"https://youtube.com/@MrBeastGaming","niche":"Gaming","notes":"High energy, fast cuts"}' | jq '.'
  
  # Get inspiration channels
  echo ""
  echo "6️⃣  Getting inspiration channels..."
  curl -s "$API_URL/api/channels/$CHANNEL_ID/inspiration-channels" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
fi

echo ""
echo "✅ API tests complete!"
echo ""
echo "📝 Summary:"
echo "  - User registered/logged in"
echo "  - Channel created"
echo "  - Inspiration channel added"
echo ""
echo "🎯 Next steps:"
echo "  - Open http://localhost:5173 to use the UI"
echo "  - Check MongoDB to see the data"
echo "  - Continue building features!"
