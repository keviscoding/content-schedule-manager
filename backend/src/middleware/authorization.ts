import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { Channel } from '../models/Channel';
import { ChannelEditor } from '../models/ChannelEditor';

export const requireOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'owner') {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Only owners can perform this action',
      },
    });
  }
  next();
};

export const requireEditor = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'editor' && req.user?.role !== 'owner') {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Editor or owner role required',
      },
    });
  }
  next();
};

export const requireChannelAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const channelId = req.params.id || req.params.channelId || req.body.channelId;
    
    if (!channelId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Channel ID is required',
        },
      });
    }

    const channel = await Channel.findById(channelId);
    
    if (!channel) {
      return res.status(404).json({
        error: {
          code: 'CHANNEL_NOT_FOUND',
          message: 'Channel not found',
        },
      });
    }

    // Owners have access to their own channels
    if (channel.ownerId.toString() === req.user!.userId) {
      return next();
    }

    // Editors need to be assigned to the channel
    if (req.user!.role === 'editor') {
      const assignment = await ChannelEditor.findOne({
        channelId,
        editorId: req.user!.userId,
      });

      if (assignment) {
        return next();
      }
    }

    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have access to this channel',
      },
    });
  } catch (error) {
    console.error('Channel access check error:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to verify channel access',
      },
    });
  }
};

export const requireChannelOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const channelId = req.params.id || req.params.channelId;
    
    if (!channelId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Channel ID is required',
        },
      });
    }

    const channel = await Channel.findById(channelId);
    
    if (!channel) {
      return res.status(404).json({
        error: {
          code: 'CHANNEL_NOT_FOUND',
          message: 'Channel not found',
        },
      });
    }

    if (channel.ownerId.toString() !== req.user!.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only the channel owner can perform this action',
        },
      });
    }

    next();
  } catch (error) {
    console.error('Channel ownership check error:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to verify channel ownership',
      },
    });
  }
};
