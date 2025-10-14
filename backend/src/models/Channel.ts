import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInspirationChannel {
  _id: Types.ObjectId;
  name: string;
  youtubeUrl: string;
  niche: string;
  notes: string | null;
  addedAt: Date;
}

export interface IChannel extends Document {
  name: string;
  youtubeUrl: string;
  targetPostingTime: string;
  ownerId: Types.ObjectId;
  status: 'on-time' | 'due-soon' | 'overdue';
  lastPostedAt: Date | null;
  nextDeadline: Date | null;
  inspirationChannels: IInspirationChannel[];
  lastYouTubeCheck: Date | null;
  youtubeChannelId: string | null;
  latestVideoDate: Date | null;
  latestVideoTitle: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const InspirationChannelSchema = new Schema<IInspirationChannel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    youtubeUrl: {
      type: String,
      required: true,
      trim: true,
    },
    niche: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: null,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const ChannelSchema = new Schema<IChannel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    youtubeUrl: {
      type: String,
      required: true,
      trim: true,
    },
    targetPostingTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['on-time', 'due-soon', 'overdue'],
      default: 'on-time',
    },
    lastPostedAt: {
      type: Date,
      default: null,
    },
    nextDeadline: {
      type: Date,
      default: null,
    },
    inspirationChannels: {
      type: [InspirationChannelSchema],
      default: [],
    },
    lastYouTubeCheck: {
      type: Date,
      default: null,
    },
    youtubeChannelId: {
      type: String,
      default: null,
    },
    latestVideoDate: {
      type: Date,
      default: null,
    },
    latestVideoTitle: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ChannelSchema.index({ ownerId: 1, status: 1 });

export const Channel = mongoose.model<IChannel>('Channel', ChannelSchema);
