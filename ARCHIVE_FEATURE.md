# Archive Feature

## Overview
The archive feature allows you to hide channels you're not actively working on without deleting them. This keeps your dashboard clean and focused on active channels while preserving all data for channels you might return to later.

## Features

### Backend Changes
- **Database Schema**: Added `isArchived` (boolean) and `archivedAt` (date) fields to the Channel model
- **API Endpoints**:
  - `GET /api/channels?archived=true` - Fetch archived channels
  - `GET /api/channels?archived=false` - Fetch active channels (default)
  - `POST /api/channels/:id/archive` - Archive a channel
  - `POST /api/channels/:id/unarchive` - Restore an archived channel

### Frontend Changes
- **Dashboard Toggle**: Button to switch between active and archived channels view
- **Archive Button**: Archive icon on each channel card (when viewing active channels)
- **Unarchive Button**: Restore icon on each channel card (when viewing archived channels)
- **Updated Stats**: Stats cards now show counts for the current view (active or archived)
- **Empty States**: Different messages for empty active vs empty archived views

## How to Use

### Archiving a Channel
1. Go to your Dashboard
2. Find the channel you want to archive
3. Click the archive icon (box with arrow) in the top-right corner of the channel card
4. Confirm the action
5. The channel will be removed from your active view

### Viewing Archived Channels
1. Click the "Show Archived" button in the action bar
2. All archived channels will be displayed
3. The stats will update to show archived channel counts

### Unarchiving a Channel
1. Switch to the archived view by clicking "Show Archived"
2. Find the channel you want to restore
3. Click the unarchive icon (box with up arrow) in the top-right corner
4. Confirm the action
5. The channel will be restored to your active channels

### Deleting vs Archiving
- **Archive**: Temporarily hide a channel. All data is preserved and can be restored anytime.
- **Delete**: Permanently remove a channel and all associated data (editors, tasks, etc.). This cannot be undone.

## Technical Details

### Database Migration
No migration is needed! The new fields have default values:
- `isArchived`: defaults to `false`
- `archivedAt`: defaults to `null`

All existing channels will automatically be treated as active (not archived).

### Permissions
- Only channel owners can archive/unarchive channels
- Editors can view channels they're assigned to, whether active or archived
- The archive status is preserved when switching between views

### Query Performance
The `isArchived` field is indexed for fast filtering when loading the dashboard.

## Future Enhancements
Potential improvements for the archive feature:
- Bulk archive/unarchive operations
- Auto-archive channels after X days of inactivity
- Archive statistics and history
- Search within archived channels
- Archive reasons/notes
