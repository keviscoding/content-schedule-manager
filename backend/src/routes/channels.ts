import express, { Response } from 'express';
import { Channel } from '../models/Channel';
import { ChannelEditor } from '../models/ChannelEditor';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireOwner, requireChannelOwnership } from '../middleware/authorization';
import { fetchYouTubeChannelData } from '../services/youtube';

const router = express.Router();

// Get all channels for the current user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const showArchived = req.query.archived === 'true';
    const filter: any = showArchived ? { isArchived: true } : { isArchived: { $ne: true } };

    let channels;

    if (req.user!.role === 'owner') {
      // Owners see their own channels
      channels = await Channel.find({ 
        ownerId: req.user!.userId,
        ...filter
      }).sort({ status: 1, name: 1 });
    } else {
      // Editors see channels they're assigned to
      const assignments = await ChannelEditor.find({ editorId: req.user!.userId });
      const channelIds = assignments.map(a => a.channelId);
      channels = await Channel.find({ 
        _id: { $in: channelIds },
        ...filter
      }).sort({ status: 1, name: 1 });
    }

    res.json({ channels });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch channels',
      },
    });
  }
});

// Create a new channel
router.post('/', authenticate, requireOwner, async (req: AuthRequest, res: Response) => {
  try {
    const { name, youtubeUrl, targetPostingTime } = req.body;

    if (!name || !youtubeUrl || !targetPostingTime) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, YouTube URL, and target posting time are required',
        },
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(targetPostingTime)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid time format. Use HH:MM format',
        },
      });
    }

    const channel = await Channel.create({
      name,
      youtubeUrl,
      targetPostingTime,
      ownerId: req.user!.userId,
      status: 'on-time',
    });

    res.status(201).json({ channel });
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create channel',
      },
    });
  }
});

// Get a specific channel
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({
        error: {
          code: 'CHANNEL_NOT_FOUND',
          message: 'Channel not found',
        },
      });
    }

    // Check access
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
        channelId: req.params.id,
        editorId: req.user!.userId,
      });

      if (!assignment) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this channel',
          },
        });
      }
    }

    // Fetch YouTube data
    const youtubeData = await fetchYouTubeChannelData(channel.youtubeUrl);

    res.json({ channel, youtubeData });
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch channel',
      },
    });
  }
});

// Update a channel
router.put('/:id', authenticate, requireChannelOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const { name, youtubeUrl, targetPostingTime } = req.body;
    const updates: any = {};

    if (name) updates.name = name;
    if (youtubeUrl) updates.youtubeUrl = youtubeUrl;
    if (targetPostingTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(targetPostingTime)) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid time format. Use HH:MM format',
          },
        });
      }
      updates.targetPostingTime = targetPostingTime;
    }

    const channel = await Channel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json({ channel });
  } catch (error) {
    console.error('Update channel error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update channel',
      },
    });
  }
});

// Delete a channel
router.delete('/:id', authenticate, requireChannelOwnership, async (req: AuthRequest, res: Response) => {
  try {
    await Channel.findByIdAndDelete(req.params.id);
    await ChannelEditor.deleteMany({ channelId: req.params.id });

    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete channel',
      },
    });
  }
});

// Manually refresh YouTube data for a channel
router.post('/:id/refresh-youtube', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({
        error: {
          code: 'CHANNEL_NOT_FOUND',
          message: 'Channel not found',
        },
      });
    }

    // Check access
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
        channelId: req.params.id,
        editorId: req.user!.userId,
      });

      if (!assignment) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this channel',
          },
        });
      }
    }

    // Fetch fresh YouTube data
    const youtubeData = await fetchYouTubeChannelData(channel.youtubeUrl);

    if (youtubeData) {
      channel.latestVideoDate = youtubeData.latestVideoDate;
      channel.latestVideoTitle = youtubeData.latestVideoTitle;
      channel.lastYouTubeCheck = new Date();

      // Update status (18-24 hour posting schedule)
      const hoursSinceUpload = (Date.now() - youtubeData.latestVideoDate.getTime()) / (1000 * 60 * 60);
      if (hoursSinceUpload > 24) {
        channel.status = 'overdue';
      } else if (hoursSinceUpload > 18) {
        channel.status = 'due-soon';
      } else {
        channel.status = 'on-time';
      }

      await channel.save();
    }

    res.json({ 
      channel,
      youtubeData,
      message: 'YouTube data refreshed successfully'
    });
  } catch (error) {
    console.error('Refresh YouTube data error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to refresh YouTube data',
      },
    });
  }
});

// Archive a channel
router.post('/:id/archive', authenticate, requireChannelOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const channel = await Channel.findByIdAndUpdate(
      req.params.id,
      { 
        isArchived: true,
        archivedAt: new Date()
      },
      { new: true }
    );

    if (!channel) {
      return res.status(404).json({
        error: {
          code: 'CHANNEL_NOT_FOUND',
          message: 'Channel not found',
        },
      });
    }

    res.json({ 
      channel,
      message: 'Channel archived successfully' 
    });
  } catch (error) {
    console.error('Archive channel error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to archive channel',
      },
    });
  }
});

// Unarchive a channel
router.post('/:id/unarchive', authenticate, requireChannelOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const channel = await Channel.findByIdAndUpdate(
      req.params.id,
      { 
        isArchived: false,
        archivedAt: null
      },
      { new: true }
    );

    if (!channel) {
      return res.status(404).json({
        error: {
          code: 'CHANNEL_NOT_FOUND',
          message: 'Channel not found',
        },
      });
    }

    res.json({ 
      channel,
      message: 'Channel unarchived successfully' 
    });
  } catch (error) {
    console.error('Unarchive channel error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to unarchive channel',
      },
    });
  }
});

export default router;

// Assign editor to channel
router.post('/:id/editors', authenticate, requireChannelOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const { editorId } = req.body;

    if (!editorId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Editor ID is required',
        },
      });
    }

    const editor = await User.findById(editorId);
    if (!editor || editor.role !== 'editor') {
      return res.status(400).json({
        error: {
          code: 'INVALID_EDITOR',
          message: 'Invalid editor ID or user is not an editor',
        },
      });
    }

    // Check if already assigned
    const existing = await ChannelEditor.findOne({
      channelId: req.params.id,
      editorId,
    });

    if (existing) {
      return res.status(400).json({
        error: {
          code: 'ALREADY_ASSIGNED',
          message: 'Editor is already assigned to this channel',
        },
      });
    }

    const assignment = await ChannelEditor.create({
      channelId: req.params.id,
      editorId,
    });

    res.status(201).json({ assignment });
  } catch (error) {
    console.error('Assign editor error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to assign editor',
      },
    });
  }
});

// Remove editor from channel
router.delete('/:id/editors/:editorId', authenticate, requireChannelOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const result = await ChannelEditor.findOneAndDelete({
      channelId: req.params.id,
      editorId: req.params.editorId,
    });

    if (!result) {
      return res.status(404).json({
        error: {
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Editor assignment not found',
        },
      });
    }

    res.json({ message: 'Editor removed successfully' });
  } catch (error) {
    console.error('Remove editor error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to remove editor',
      },
    });
  }
});

// Get editors for a channel
router.get('/:id/editors', authenticate, requireChannelOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const assignments = await ChannelEditor.find({ channelId: req.params.id }).populate('editorId', 'name email');
    res.json({ editors: assignments });
  } catch (error) {
    console.error('Get editors error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch editors',
      },
    });
  }
});

// Add inspiration channel
router.post('/:id/inspiration-channels', authenticate, requireChannelOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const { name, youtubeUrl, niche, notes } = req.body;

    if (!name || !youtubeUrl || !niche) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, YouTube URL, and niche are required',
        },
      });
    }

    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({
        error: {
          code: 'CHANNEL_NOT_FOUND',
          message: 'Channel not found',
        },
      });
    }

    channel.inspirationChannels.push({
      name,
      youtubeUrl,
      niche,
      notes: notes || null,
      addedAt: new Date(),
    } as any);

    await channel.save();

    res.status(201).json({ 
      inspirationChannel: channel.inspirationChannels[channel.inspirationChannels.length - 1] 
    });
  } catch (error) {
    console.error('Add inspiration channel error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to add inspiration channel',
      },
    });
  }
});

// Get inspiration channels
router.get('/:id/inspiration-channels', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const channel = await Channel.findById(req.params.id);
    
    if (!channel) {
      return res.status(404).json({
        error: {
          code: 'CHANNEL_NOT_FOUND',
          message: 'Channel not found',
        },
      });
    }

    // Check access
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
        channelId: req.params.id,
        editorId: req.user!.userId,
      });

      if (!assignment) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this channel',
          },
        });
      }
    }

    // Fetch YouTube data for each inspiration channel
    const inspirationChannelsWithData = await Promise.all(
      channel.inspirationChannels.map(async (inspoChannel) => {
        const youtubeData = await fetchYouTubeChannelData(inspoChannel.youtubeUrl);
        return {
          ...inspoChannel.toObject(),
          youtubeData,
        };
      })
    );

    res.json({ inspirationChannels: inspirationChannelsWithData });
  } catch (error) {
    console.error('Get inspiration channels error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch inspiration channels',
      },
    });
  }
});

// Remove inspiration channel
router.delete('/:id/inspiration-channels/:inspirationId', authenticate, requireChannelOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const channel = await Channel.findById(req.params.id);
    
    if (!channel) {
      return res.status(404).json({
        error: {
          code: 'CHANNEL_NOT_FOUND',
          message: 'Channel not found',
        },
      });
    }

    const initialLength = channel.inspirationChannels.length;
    channel.inspirationChannels = channel.inspirationChannels.filter(
      ic => ic._id.toString() !== req.params.inspirationId
    );

    if (channel.inspirationChannels.length === initialLength) {
      return res.status(404).json({
        error: {
          code: 'INSPIRATION_CHANNEL_NOT_FOUND',
          message: 'Inspiration channel not found',
        },
      });
    }

    await channel.save();

    res.json({ message: 'Inspiration channel removed successfully' });
  } catch (error) {
    console.error('Remove inspiration channel error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to remove inspiration channel',
      },
    });
  }
});

// Get channel timeline
router.get('/:id/timeline', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const channel = await Channel.findById(req.params.id);
    
    if (!channel) {
      return res.status(404).json({
        error: {
          code: 'CHANNEL_NOT_FOUND',
          message: 'Channel not found',
        },
      });
    }

    // Check access
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
        channelId: req.params.id,
        editorId: req.user!.userId,
      });

      if (!assignment) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this channel',
          },
        });
      }
    }

    // Get all posted videos for this channel
    const { Video } = await import('../models/Video');
    const postedVideos = await Video.find({
      channelId: req.params.id,
      status: 'posted',
      postedAt: { $ne: null },
    }).sort({ postedAt: -1 });

    // Build timeline with gaps
    const timeline = postedVideos.map((video, index) => {
      const item: any = {
        videoId: video._id,
        title: video.title,
        postedAt: video.postedAt,
        onTime: true,
      };

      if (index < postedVideos.length - 1) {
        const nextVideo = postedVideos[index + 1];
        const hoursDiff = (video.postedAt!.getTime() - nextVideo.postedAt!.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          item.onTime = false;
          item.gapHours = hoursDiff;
        }
      }

      return item;
    });

    res.json({ timeline });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch timeline',
      },
    });
  }
});
