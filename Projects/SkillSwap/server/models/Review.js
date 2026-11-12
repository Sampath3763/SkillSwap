import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    swapRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillSwapRequest',
      required: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      maxlength: 500,
      default: '',
    },
    skillQuality: {
      type: Number,
      min: 1,
      max: 5,
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
