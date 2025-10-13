import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChannelEditor extends Document {
  channelId: Types.ObjectId;
  editorId: Types.ObjectId;
  assignedAt: Date;
}

const ChannelEditorSchema = new Schema<IChannelEditor>(
  {
    channelId: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
      index: true,
    },
    editorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

ChannelEditorSchema.index({ channelId: 1, editorId: 1 }, { unique: true });

export const ChannelEditor = mongoose.model<IChannelEditor>('ChannelEditor', ChannelEditorSchema);
