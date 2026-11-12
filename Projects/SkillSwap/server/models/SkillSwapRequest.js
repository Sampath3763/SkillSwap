import mongoose from 'mongoose';

const skillSwapRequestSchema = new mongoose.Schema(
  {
    initiatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    initiatorOffersSkill: {
      name: String,
      level: String,
      mode: String,
    },
    initiatorWantsSkill: {
      name: String,
      level: String,
      mode: String,
    },
    recipientOffersSkill: {
      name: String,
      level: String,
      mode: String,
    },
    recipientWantsSkill: {
      name: String,
      level: String,
      mode: String,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    message: {
      type: String,
      default: '',
    },
    proposedDateTime: {
      type: Date,
      default: null,
    },
    meetingLink: {
      type: String,
      default: null,
    },
    meetingLinkExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SkillSwapRequest', skillSwapRequestSchema);
