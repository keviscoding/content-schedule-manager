# How to Add Editors to Channels - Step by Step Guide

## Prerequisites

Before you can add an editor to a channel, you need:
1. ✅ An editor account created (they must register as "editor")
2. ✅ A channel created by you (the owner)
3. ✅ You must be logged in as the channel owner

## Step-by-Step Process

### Step 1: Create an Editor Account

**Option A: Editor registers themselves**
1. Editor goes to your app
2. Clicks "Register" or "Sign Up"
3. Fills in:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Password: `their_password`
   - Role: **Select "Editor"** (important!)
4. Clicks "Register"
5. Editor account is created

**Option B: You create it for them** (if you have access)
```bash
# Using the API directly
curl -X POST http://your-app-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "temp_password",
    "name": "John Doe",
    "role": "editor"
  }'
```

### Step 2: Navigate to Manage Editors

1. **Login as Owner**
2. Go to **Dashboard**
3. Click on a **Channel** (the one you want to assign the editor to)
4. On the channel detail page, look for the **"Manage Editors"** button
   - It's a green button with a people icon
   - Located next to "View on YouTube", "Refresh", and "Inspiration" buttons
5. Click **"Manage Editors"**

### Step 3: Add the Editor

1. You'll see the **Manage Editors** page
2. If no editors are assigned yet, you'll see:
   - Empty state message: "No editors assigned"
   - "Add editors to give them access to this channel"
3. Click the **"Add Editor"** button (purple gradient button at top)
4. A modal will pop up with a dropdown
5. In the dropdown, select the editor:
   - Shows: `John Doe (john@example.com)`
   - Only shows editors who are NOT already assigned to this channel
6. Click **"Add Editor"** button in the modal
7. The modal closes
8. The editor now appears in the list!

### Step 4: Verify Editor Has Access

**As Owner:**
1. You'll see the editor in the list with:
   - Avatar circle with their initial (J)
   - Name: John Doe
   - Email: john@example.com
   - "Remove" button

**As Editor:**
1. Editor logs in to their account
2. They're redirected to **Editor Dashboard**
3. They now see your channel in "My Channels" section
4. They can click on the channel to see tasks
5. They can upload videos to this channel

## What Happens Behind the Scenes

### Database Changes
```javascript
// A new ChannelEditor record is created:
{
  _id: "...",
  channelId: "your_channel_id",
  editorId: "john_editor_id",
  assignedAt: "2025-01-14T10:30:00Z"
}
```

### API Calls
```javascript
// Frontend calls:
POST /api/channels/{channelId}/editors
Body: { editorId: "john_editor_id" }

// Backend:
1. Validates editor exists and has role "editor"
2. Checks if already assigned (prevents duplicates)
3. Creates ChannelEditor record
4. Returns success
```

### Access Control
```javascript
// When editor calls GET /api/channels:
1. Backend finds all ChannelEditor records where editorId = john_id
2. Returns only those channels
3. Editor sees only assigned channels
```

## Troubleshooting

### Problem: "No editors in dropdown"

**Cause**: No editor accounts exist, or all editors are already assigned

**Solution**:
1. Make sure editors have registered with role="editor"
2. Check if they're already assigned to this channel
3. Try creating a new editor account

**Verify in MongoDB**:
```javascript
// Check if editor exists
db.users.find({ role: "editor" })

// Check if already assigned
db.channeleditors.find({ channelId: "your_channel_id" })
```

### Problem: "Failed to add editor"

**Possible causes**:
1. Editor ID is invalid
2. User is not an editor (role is "owner")
3. Already assigned to this channel
4. Network error

**Check backend logs**:
```bash
# Look for error messages
"Assign editor error: ..."
```

**Verify**:
```bash
# Test the API directly
curl -X POST http://your-app-url/api/channels/{channelId}/editors \
  -H "Authorization: Bearer YOUR_OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"editorId": "EDITOR_USER_ID"}'
```

### Problem: "Editor still can't see channel"

**Cause**: Editor might be logged in with old session

**Solution**:
1. Editor should **logout**
2. Editor should **login again**
3. Channel should now appear on their dashboard

**Or refresh the page**:
- Sometimes React Query cache needs to refresh
- Press F5 or Cmd+R to reload

### Problem: "Cannot find Manage Editors button"

**Cause**: You're not the channel owner, or you're logged in as editor

**Solution**:
1. Make sure you're logged in as **owner**
2. Make sure you're on the **channel detail page** (not dashboard)
3. Look for the green button with people icon
4. Button is next to "View on YouTube" and "Refresh"

## Complete Example

### Scenario: Add editor "Sarah" to "Gaming Shorts" channel

**Step 1: Sarah registers**
```
Name: Sarah Johnson
Email: sarah@example.com
Password: sarah123
Role: editor ← IMPORTANT!
```

**Step 2: You (owner) navigate**
```
Dashboard → Click "Gaming Shorts" → Click "Manage Editors"
```

**Step 3: Add Sarah**
```
Click "Add Editor" button
Select "Sarah Johnson (sarah@example.com)" from dropdown
Click "Add Editor" in modal
```

**Step 4: Verify**
```
✅ Sarah appears in editor list
✅ Sarah logs in → sees "Gaming Shorts" on her dashboard
✅ Sarah can upload videos to "Gaming Shorts"
✅ Sarah can see tasks assigned to her for "Gaming Shorts"
```

## API Reference

### Get All Editors (for dropdown)
```
GET /api/auth/users?role=editor
Authorization: Bearer {owner_token}

Response:
{
  "users": [
    {
      "_id": "editor_id_1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "editor"
    },
    {
      "_id": "editor_id_2",
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "role": "editor"
    }
  ]
}
```

### Get Channel Editors
```
GET /api/channels/{channelId}/editors
Authorization: Bearer {owner_token}

Response:
{
  "editors": [
    {
      "_id": "assignment_id",
      "channelId": "channel_id",
      "editorId": {
        "_id": "editor_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "assignedAt": "2025-01-14T10:30:00Z"
    }
  ]
}
```

### Assign Editor
```
POST /api/channels/{channelId}/editors
Authorization: Bearer {owner_token}
Content-Type: application/json

Body:
{
  "editorId": "editor_user_id"
}

Response:
{
  "assignment": {
    "_id": "assignment_id",
    "channelId": "channel_id",
    "editorId": "editor_id",
    "assignedAt": "2025-01-14T10:30:00Z"
  }
}
```

### Remove Editor
```
DELETE /api/channels/{channelId}/editors/{editorId}
Authorization: Bearer {owner_token}

Response:
{
  "message": "Editor removed successfully"
}
```

## Testing Checklist

- [ ] Editor account created with role="editor"
- [ ] Owner can see "Manage Editors" button on channel page
- [ ] Clicking button opens Manage Editors page
- [ ] "Add Editor" button opens modal
- [ ] Dropdown shows available editors
- [ ] Selecting editor and clicking "Add Editor" works
- [ ] Editor appears in the list
- [ ] Editor can login and see the channel
- [ ] Editor can upload videos to the channel
- [ ] Owner can remove editor
- [ ] After removal, editor can't see channel anymore

## Quick Reference

**To add an editor:**
1. Editor registers with role="editor"
2. Owner goes to channel → "Manage Editors"
3. Click "Add Editor" → Select editor → Click "Add Editor"
4. Done! Editor now has access

**To remove an editor:**
1. Owner goes to channel → "Manage Editors"
2. Click "Remove" next to editor name
3. Confirm removal
4. Done! Editor loses access

---

**Need help?** Check the backend logs or MongoDB collections:
- `users` - Check if editor exists with role="editor"
- `channeleditors` - Check assignments
- Backend logs - Look for "Assign editor error"
