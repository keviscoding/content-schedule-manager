# Quick Start: Adding Editors to Channels

## 🎯 Goal
Allow an editor to work on your YouTube shorts channel by giving them access.

## ⚡ Quick Steps

### 1️⃣ Editor Creates Account (One Time)

**Editor does this:**
```
1. Go to your app
2. Click "Register"
3. Fill in:
   - Name: Their name
   - Email: Their email
   - Password: Their password
   - Role: Select "editor" ← MUST BE EDITOR!
4. Click "Register"
```

**Result**: Editor account created ✅

---

### 2️⃣ Owner Assigns Editor to Channel

**You (owner) do this:**
```
1. Login to your app
2. Go to Dashboard
3. Click on the channel you want to share
4. Click the green "Manage Editors" button
5. Click "Add Editor" button
6. Select the editor from dropdown
7. Click "Add Editor" in the modal
```

**Result**: Editor assigned to channel ✅

---

### 3️⃣ Editor Can Now Work

**Editor does this:**
```
1. Login to their account
2. Automatically sees "Editor Dashboard"
3. Sees your channel in "My Channels"
4. Can click on channel to see tasks
5. Can upload videos
6. Can complete tasks
```

**Result**: Editor working on your channel ✅

---

## 🖼️ Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    EDITOR REGISTRATION                       │
└─────────────────────────────────────────────────────────────┘

Editor → Register Page
         ↓
         Name: John Doe
         Email: john@example.com
         Password: ••••••••
         Role: [Editor] ← Select this!
         ↓
         Click "Register"
         ↓
         Account Created ✅


┌─────────────────────────────────────────────────────────────┐
│                    OWNER ASSIGNS EDITOR                      │
└─────────────────────────────────────────────────────────────┘

Owner → Dashboard
        ↓
        Click "Gaming Shorts" channel
        ↓
        Channel Detail Page
        ↓
        Click "Manage Editors" button (green)
        ↓
        Manage Editors Page
        ↓
        Click "Add Editor" button
        ↓
        Modal opens with dropdown
        ↓
        Select "John Doe (john@example.com)"
        ↓
        Click "Add Editor"
        ↓
        John appears in editor list ✅


┌─────────────────────────────────────────────────────────────┐
│                    EDITOR SEES CHANNEL                       │
└─────────────────────────────────────────────────────────────┘

Editor → Login
         ↓
         Redirected to "Editor Dashboard"
         ↓
         Sees "Gaming Shorts" in "My Channels"
         ↓
         Clicks on channel
         ↓
         Sees tasks assigned to them
         ↓
         Can upload videos ✅
```

---

## 🔍 Where to Find Things

### As Owner:

**Dashboard:**
- Shows all your channels
- "Review Videos" button (top right)
- "Add New Channel" button

**Channel Detail Page:**
- "View on YouTube" button (red)
- "Refresh" button (blue)
- **"Manage Editors" button (green)** ← Click this!
- "Inspiration" button (purple)
- "Upload Video" button (blue)

**Manage Editors Page:**
- **"Add Editor" button** ← Click this to add
- List of assigned editors
- "Remove" button next to each editor

### As Editor:

**Editor Dashboard:**
- Stats cards (channels, tasks, videos)
- "My Tasks" section
- "My Channels" section
- "Recent Videos" section

**Channel Detail Page:**
- Task board (Pending, In Progress, Completed)
- "Upload Video" button
- Upload buttons on task cards

---

## 💡 Common Questions

### Q: Where is the "Manage Editors" button?
**A:** On the channel detail page, it's a green button with a people icon. It's next to "View on YouTube" and "Refresh" buttons.

### Q: I don't see any editors in the dropdown
**A:** Make sure:
1. Editors have registered with role="editor"
2. They're not already assigned to this channel
3. Try refreshing the page

### Q: Editor can't see the channel
**A:** Make sure:
1. Editor is logged in
2. Editor logs out and logs back in (refresh session)
3. You assigned them to the correct channel
4. Editor registered with role="editor" (not "owner")

### Q: Can I assign multiple editors to one channel?
**A:** Yes! Just repeat the process for each editor.

### Q: Can one editor work on multiple channels?
**A:** Yes! Assign the same editor to multiple channels.

### Q: How do I remove an editor?
**A:** Go to "Manage Editors" → Click "Remove" next to their name → Confirm.

---

## 🎬 Example Scenario

**You have:**
- Channel: "Gaming Shorts"
- Editor: Sarah (sarah@example.com)

**Goal:** Let Sarah upload videos to "Gaming Shorts"

**Steps:**

1. **Sarah registers** (if not already):
   - Goes to your app
   - Registers with role="editor"

2. **You assign Sarah**:
   - Login → Dashboard
   - Click "Gaming Shorts"
   - Click "Manage Editors" (green button)
   - Click "Add Editor"
   - Select "Sarah (sarah@example.com)"
   - Click "Add Editor"

3. **Sarah can now work**:
   - Sarah logs in
   - Sees "Gaming Shorts" on her dashboard
   - Can upload videos
   - Can complete tasks

**Done!** 🎉

---

## 🚨 Troubleshooting

### Problem: Can't find "Manage Editors" button
- Make sure you're logged in as **owner** (not editor)
- Make sure you're on the **channel detail page** (not dashboard)
- Look for the **green button** with people icon

### Problem: Dropdown is empty
- Make sure editors have **registered**
- Make sure they selected **role="editor"**
- Check if they're already assigned (won't show in dropdown)

### Problem: Editor still can't see channel
- Editor should **logout and login again**
- Or **refresh the page** (F5 or Cmd+R)
- Check if assignment was successful (should appear in editor list)

### Problem: "Failed to add editor" error
- Check backend logs for details
- Make sure editor ID is valid
- Make sure user has role="editor"
- Try refreshing and trying again

---

## 📞 Need More Help?

Check these files:
- `HOW_TO_ADD_EDITORS.md` - Detailed guide with API reference
- `EDITOR_ACCESS_CONTROL.md` - Technical documentation
- Backend logs - Look for errors

Or check MongoDB:
```javascript
// Check if editor exists
db.users.find({ email: "editor@example.com" })

// Check if assigned
db.channeleditors.find({ channelId: "your_channel_id" })
```

---

**That's it!** The process is simple:
1. Editor registers with role="editor"
2. Owner assigns editor via "Manage Editors"
3. Editor can now work on the channel

🎉 Happy editing!
