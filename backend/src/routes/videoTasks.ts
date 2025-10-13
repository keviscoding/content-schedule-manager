import express, { Response } from 'express';
import { VideoTask } from '../models/VideoTask';
import { Video } from '../models/Video';
import { Channel } from '../models/Channel';
import { ChannelEditor } from '../models/ChannelEditor';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateUploadUrl, getFileUrl } from '../utils/storage';

const router = express.Router();

// Create a video task (owner assigns to editor)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { channelId, assignedToId, title, description, instructions, dueDate, rawVideoUrl } = req.body;

    if (!channelId || !assignedToId || !title) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Channel ID, assigned editor ID, and title are required',
        },
      });
    }

    // Verify channel ownership
    const channel = await Channel.findById(channelId);
    if (!channel || channel.ownerId.toString() !== req.user!.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the channel owner can create tasks',
        },
      });
    }

    // Verify editor is assigned to channel
    const assignment = await ChannelEditor.findOne({
      channelId,
      editorId: assignedToId,
    });

    if (!assignment) {
      return res.status(400).json({
        error: {
          code: 'EDITOR_NOT_ASSIGNED',
          message: 'Editor is not assigned to this channel',
        },
      });
    }

    const task = await VideoTask.create({
      channelId,
      assignedToId,
      assignedById: req.user!.userId,
      title,
      description: description || '',
      instructions: instructions || '',
      dueDate: dueDate || null,
      rawVideoUrl: rawVideoUrl || null,
      status: 'pending',
    });

    const populatedTask = await VideoTask.findById(task._id)
      .populate('assignedToId', 'name email')
      .populate('channelId', 'name');

    res.status(201).json({ task: populatedTask });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create task',
      },
    });
  }
});

// Get all tasks (filtered by user role)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { channelId, status } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    let tasks;

    if (req.user!.role === 'owner') {
      // Owners see tasks for their channels
      const channels = await Channel.find({ ownerId: req.user!.userId });
      const channelIds = channels.map(c => c._id);
      filter.channelId = { $in: channelIds };

      if (channelId) {
        filter.channelId = channelId;
      }

      tasks = await VideoTask.find(filter)
        .populate('assignedToId', 'name email')
        .populate('channelId', 'name')
        .populate('completedVideoId')
        .sort({ createdAt: -1 });
    } else {
      // Editors see tasks assigned to them
      filter.assignedToId = req.user!.userId;

      if (channelId) {
        filter.channelId = channelId;
      }

      tasks = await VideoTask.find(filter)
        .populate('channelId', 'name')
        .populate('completedVideoId')
        .sort({ createdAt: -1 });
    }

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch tasks',
      },
    });
  }
});

// Get a specific task
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const task = await VideoTask.findById(req.params.id)
      .populate('assignedToId', 'name email')
      .populate('assignedById', 'name email')
      .populate('channelId', 'name')
      .populate('completedVideoId');

    if (!task) {
      return res.status(404).json({
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found',
        },
      });
    }

    // Check access
    const channel = await Channel.findById(task.channelId);
    if (!channel) {
      return res.status(404).json({
        error: {
          code: 'CHANNEL_NOT_FOUND',
          message: 'Channel not found',
        },
      });
    }

    if (
      req.user!.role === 'owner' &&
      channel.ownerId.toString() !== req.user!.userId
    ) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this task',
        },
      });
    }

    if (
      req.user!.role === 'editor' &&
      task.assignedToId.toString() !== req.user!.userId
    ) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this task',
        },
      });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch task',
      },
    });
  }
});

// Update task status (editor marks as in-progress)
router.put('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const task = await VideoTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found',
        },
      });
    }

    // Only assigned editor can update status
    if (task.assignedToId.toString() !== req.user!.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the assigned editor can update task status',
        },
      });
    }

    if (status && ['pending', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      task.status = status;
      await task.save();
    }

    res.json({ task });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update task status',
      },
    });
  }
});

// Complete task by uploading finished video
router.post('/:id/complete', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.body;
    const task = await VideoTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found',
        },
      });
    }

    // Only assigned editor can complete
    if (task.assignedToId.toString() !== req.user!.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the assigned editor can complete this task',
        },
      });
    }

    // Verify video exists and belongs to the right channel
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: 'Video not found',
        },
      });
    }

    if (video.channelId.toString() !== task.channelId.toString()) {
      return res.status(400).json({
        error: {
          code: 'CHANNEL_MISMATCH',
          message: 'Video must belong to the same channel as the task',
        },
      });
    }

    task.status = 'completed';
    task.completedVideoId = video._id as any;
    task.completedAt = new Date();
    await task.save();

    const populatedTask = await VideoTask.findById(task._id)
      .populate('assignedToId', 'name email')
      .populate('channelId', 'name')
      .populate('completedVideoId');

    res.json({ task: populatedTask });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to complete task',
      },
    });
  }
});

// Delete task (owner only)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const task = await VideoTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found',
        },
      });
    }

    // Only owner can delete
    const channel = await Channel.findById(task.channelId);
    if (!channel || channel.ownerId.toString() !== req.user!.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the channel owner can delete tasks',
        },
      });
    }

    await VideoTask.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete task',
      },
    });
  }
});

// Upload raw video for task (owner uploads video for editor to work on)
router.post('/:id/upload-raw', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { fileName, fileType } = req.body;
    const task = await VideoTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found',
        },
      });
    }

    // Only owner can upload raw video
    const channel = await Channel.findById(task.channelId);
    if (!channel || channel.ownerId.toString() !== req.user!.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the channel owner can upload raw videos',
        },
      });
    }

    // Generate presigned URL
    const uploadUrl = await generateUploadUrl(fileName, fileType);
    const key = `raw-videos/${Date.now()}-${fileName}`;
    const fileUrl = getFileUrl(key);

    task.rawVideoUrl = fileUrl;
    await task.save();

    res.json({ uploadUrl, fileUrl });
  } catch (error) {
    console.error('Upload raw video error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to upload raw video',
      },
    });
  }
});

export default router;
