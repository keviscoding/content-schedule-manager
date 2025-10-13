import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description: string;
  tags: string[];
  channelId: Types.ObjectId;
  uploadedById: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'needs-revision' | 'posted';
  fileUrl: string;
  fileSize: number;
  duration: number;
  thumbnailUrl: string | null;
  rejectionNotes: string | null;
  postedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
      index: true,
    },
    uploadedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs-revision', 'posted'],
      default: 'pending',
      index: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    rejectionNotes: {
      type: String,
      default: null,
    },
    postedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

VideoSchema.index({ channelId: 1, status: 1 });
VideoSchema.index({ uploadedById: 1, status: 1 });

export const Video = mongoose.model<IVideo>('Video', VideoSchema);
