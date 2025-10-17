import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVideoTask extends Document {
  channelId: Types.ObjectId;
  assignedToId: Types.ObjectId;
  assignedById: Types.ObjectId;
  title: string;
  description: string;
  rawVideoUrl: string | null; // Original video to edit
  instructions: string;
  scriptUrl: string | null; // Script file/link
  voiceoverUrl: string | null; // Voiceover file/link
  clipsUrl: string | null; // Clips/footage file/link
  dueDate: Date | null;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  completedVideoId: Types.ObjectId | null; // Reference to uploaded Video
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const VideoTaskSchema = new Schema<IVideoTask>(
  {
    channelId: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
      index: true,
    },
    assignedToId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    rawVideoUrl: {
      type: String,
      default: null,
    },
    instructions: {
      type: String,
      default: '',
    },
    scriptUrl: {
      type: String,
      default: null,
    },
    voiceoverUrl: {
      type: String,
      default: null,
    },
    clipsUrl: {
      type: String,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    completedVideoId: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

VideoTaskSchema.index({ assignedToId: 1, status: 1 });
VideoTaskSchema.index({ channelId: 1, status: 1 });

export const VideoTask = mongoose.model<IVideoTask>('VideoTask', VideoTaskSchema);
