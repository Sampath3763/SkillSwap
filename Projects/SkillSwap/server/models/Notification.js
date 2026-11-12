import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['swap_request', 'swap_accepted', 'swap_rejected', 'meeting_scheduled', 'swap_completed'],
      required: true,
    },
    title: String,
    message: String,
    relatedSwapRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillSwapRequest',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
