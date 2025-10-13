import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVideoStatusHistory extends Document {
  videoId: Types.ObjectId;
  status: string;
  changedById: Types.ObjectId;
  notes: string | null;
  createdAt: Date;
}

const VideoStatusHistorySchema = new Schema<IVideoStatusHistory>(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
    },
    changedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

VideoStatusHistorySchema.index({ videoId: 1, createdAt: -1 });

export const VideoStatusHistory = mongoose.model<IVideoStatusHistory>(
  'VideoStatusHistory',
  VideoStatusHistorySchema
);
