import express, { Response } from 'express';
import { Video } from '../models/Video';
import { Channel } from '../models/Channel';
import { ChannelEditor } from '../models/ChannelEditor';
import { VideoStatusHistory } from '../models/VideoStatusHistory';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateUploadUrl, getFileUrl, deleteFile, extractKeyFromUrl, generateViewUrl } from '../utils/storage';

const router = express.Router();

// Initiate video upload (get presigned URL)
router.post('/upload', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { fileName, fileType, fileSize, title, description, tags, channelId } = req.body;

    if (!fileName || !fileType || !fileSize || !title || !channelId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'File name, type, size, title, and channel ID are required',
        },
      });
    }

    // Validate file size (max 500MB)
    if (fileSize > 500 * 1024 * 1024) {
      return res.status(400).json({
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds 500MB limit',
        },
      });
    }

    // Check channel access
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        error: {
          code: 'CHANNEL_NOT_FOUND',
          message: 'Channel not found',
        },
      });
    }

    // Verify user has access to upload to this channel
    if (req.user!.role === 'owner' && channel.ownerId.toString() !== req.user!.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this channel',
        },
      });
    }

    if (req.user!.role === 'editor') {
      const assignment = await ChannelEditor.findOne({
        channelId,
        editorId: req.user!.userId,
      });

      if (!assignment) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You are not assigned to this channel',
          },
        });
      }
    }

    // Check if S3/Spaces is configured
    if (!process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
      return res.status(500).json({
        error: {
          code: 'STORAGE_NOT_CONFIGURED',
          message: 'Storage (S3/Spaces) is not configured. Please set S3_BUCKET, S3_ACCESS_KEY, and S3_SECRET_KEY environment variables.',
        },
      });
    }

    // Generate presigned URL and get the key
    const { uploadUrl, key } = await generateUploadUrl(fileName, fileType);

    // Create video record - store the key, not the full URL
    const video = await Video.create({
      title,
      description: description || '',
      tags: tags || [],
      channelId,
      uploadedById: req.user!.userId,
      status: 'pending',
      fileUrl: key, // Store just the key (videos/timestamp-filename.mp4)
      fileSize,
    });

    // Create status history
    await VideoStatusHistory.create({
      videoId: video._id,
      status: 'pending',
      changedById: req.user!.userId,
    });

    res.status(201).json({
      video,
      uploadUrl,
    });
  } catch (error: any) {
    console.error('Upload initiation error:', error);
    
    // Check if it's an S3 configuration error
    if (error.name === 'CredentialsProviderError' || error.message?.includes('credentials')) {
      return res.status(500).json({
        error: {
          code: 'STORAGE_CREDENTIALS_ERROR',
          message: 'Storage credentials are invalid. Please check S3_ACCESS_KEY and S3_SECRET_KEY.',
        },
      });
    }
    
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to initiate upload',
      },
    });
  }
});

export default router;

// Get all videos (filtered by user role)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { channelId, status } = req.query;
    const filter: any = {};

    if (channelId) {
      filter.channelId = channelId;
    }

    if (status) {
      filter.status = status;
    }

    let videos;

    if (req.user!.role === 'owner') {
      // Owners see videos from their channels
      const channels = await Channel.find({ ownerId: req.user!.userId });
      const channelIds = channels.map(c => c._id);
      filter.channelId = { $in: channelIds };
      videos = await Video.find(filter).populate('channelId', 'name').sort({ createdAt: -1 });
    } else {
      // Editors see videos they uploaded or from assigned channels
      const assignments = await ChannelEditor.find({ editorId: req.user!.userId });
      const channelIds = assignments.map(a => a.channelId);
      filter.$or = [
        { uploadedById: req.user!.userId },
        { channelId: { $in: channelIds } },
      ];
      videos = await Video.find(filter).populate('channelId', 'name').sort({ createdAt: -1 });
    }

    // Generate presigned URLs for all videos
    const videosWithViewUrls = await Promise.all(
      videos.map(async (video) => {
        try {
          // fileUrl is now just the key (videos/timestamp-filename.mp4)
          const viewUrl = await generateViewUrl(video.fileUrl);
          return {
            ...video.toObject(),
            fileUrl: viewUrl,
          };
        } catch (error) {
          console.error('Failed to generate view URL for video:', video._id, error);
          return video.toObject();
        }
      })
    );

    res.json({ videos: videosWithViewUrls });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch videos',
      },
    });
  }
});

// Get a specific video
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const video = await Video.findById(req.params.id).populate('channelId uploadedById', 'name email');

    if (!video) {
      return res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: 'Video not found',
        },
      });
    }

    // Check access
    const channel = await Channel.findById(video.channelId);
    if (!channel) {
      return res.status(404).json({
        error: {
          code: 'CHANNEL_NOT_FOUND',
          message: 'Channel not found',
        },
      });
    }

    if (req.user!.role === 'owner' && channel.ownerId.toString() !== req.user!.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this video',
        },
      });
    }

    if (req.user!.role === 'editor') {
      const assignment = await ChannelEditor.findOne({
        channelId: video.channelId,
        editorId: req.user!.userId,
      });

      if (!assignment && video.uploadedById.toString() !== req.user!.userId) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this video',
          },
        });
      }
    }

    // Get status history
    const history = await VideoStatusHistory.find({ videoId: video._id })
      .populate('changedById', 'name')
      .sort({ createdAt: -1 });

    // Generate presigned URL for viewing
    try {
      // fileUrl is now just the key (videos/timestamp-filename.mp4)
      const viewUrl = await generateViewUrl(video.fileUrl);
      const videoWithViewUrl = {
        ...video.toObject(),
        fileUrl: viewUrl, // Replace with presigned URL
      };
      res.json({ video: videoWithViewUrl, history });
    } catch (error) {
      // If presigned URL generation fails, return original URL
      console.error('Failed to generate view URL:', error);
      res.json({ video, history });
    }
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch video',
      },
    });
  }
});

// Update video metadata
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, tags } = req.body;
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: 'Video not found',
        },
      });
    }

    // Only uploader or channel owner can update
    const channel = await Channel.findById(video.channelId);
    if (!channel) {
      return res.status(404).json({
        error: {
          code: 'CHANNEL_NOT_FOUND',
          message: 'Channel not found',
        },
      });
    }

    if (
      video.uploadedById.toString() !== req.user!.userId &&
      channel.ownerId.toString() !== req.user!.userId
    ) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this video',
        },
      });
    }

    if (title) video.title = title;
    if (description) video.description = description;
    if (tags) video.tags = tags;

    await video.save();

    res.json({ video });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update video',
      },
    });
  }
});

// Delete video
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: 'Video not found',
        },
      });
    }

    // Only uploader or channel owner can delete
    const channel = await Channel.findById(video.channelId);
    if (!channel) {
      return res.status(404).json({
        error: {
          code: 'CHANNEL_NOT_FOUND',
          message: 'Channel not found',
        },
      });
    }

    if (
      video.uploadedById.toString() !== req.user!.userId &&
      channel.ownerId.toString() !== req.user!.userId
    ) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this video',
        },
      });
    }

    // Delete from storage
    try {
      const key = extractKeyFromUrl(video.fileUrl);
      await deleteFile(key);
    } catch (error) {
      console.error('Failed to delete file from storage:', error);
    }

    await Video.findByIdAndDelete(req.params.id);
    await VideoStatusHistory.deleteMany({ videoId: req.params.id });

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete video',
      },
    });
  }
});

// Approve video
router.post('/:id/approve', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: 'Video not found',
        },
      });
    }

    // Only channel owner can approve
    const channel = await Channel.findById(video.channelId);
    if (!channel || channel.ownerId.toString() !== req.user!.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the channel owner can approve videos',
        },
      });
    }

    video.status = 'approved';
    await video.save();

    await VideoStatusHistory.create({
      videoId: video._id,
      status: 'approved',
      changedById: req.user!.userId,
    });

    res.json({ video });
  } catch (error) {
    console.error('Approve video error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to approve video',
      },
    });
  }
});

// Reject video
router.post('/:id/reject', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { notes } = req.body;
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: 'Video not found',
        },
      });
    }

    // Only channel owner can reject
    const channel = await Channel.findById(video.channelId);
    if (!channel || channel.ownerId.toString() !== req.user!.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the channel owner can reject videos',
        },
      });
    }

    video.status = 'rejected';
    video.rejectionNotes = notes || null;
    await video.save();

    await VideoStatusHistory.create({
      videoId: video._id,
      status: 'rejected',
      changedById: req.user!.userId,
      notes: notes || null,
    });

    res.json({ video });
  } catch (error) {
    console.error('Reject video error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to reject video',
      },
    });
  }
});

// Mark video as posted
router.post('/:id/mark-posted', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: 'Video not found',
        },
      });
    }

    // Only channel owner can mark as posted
    const channel = await Channel.findById(video.channelId);
    if (!channel || channel.ownerId.toString() !== req.user!.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the channel owner can mark videos as posted',
        },
      });
    }

    const postedAt = new Date();
    video.status = 'posted';
    video.postedAt = postedAt;
    await video.save();

    // Update channel's last posted time
    channel.lastPostedAt = postedAt;
    channel.nextDeadline = new Date(postedAt.getTime() + 24 * 60 * 60 * 1000);
    await channel.save();

    await VideoStatusHistory.create({
      videoId: video._id,
      status: 'posted',
      changedById: req.user!.userId,
    });

    res.json({ video });
  } catch (error) {
    console.error('Mark posted error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to mark video as posted',
      },
    });
  }
});
