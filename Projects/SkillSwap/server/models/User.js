import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    availability: {
      type: String,
      enum: ['online', 'offline', 'both'],
      default: 'both',
    },
    skillsOffered: [
      {
        name: String,
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'] },
        mode: { type: String, enum: ['Online', 'Offline', 'Both'] },
      },
    ],
    skillsWanted: [
      {
        name: String,
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'] },
        mode: { type: String, enum: ['Online', 'Offline', 'Both'] },
      },
    ],
    skillCredits: {
      type: Number,
      default: 100,
      min: 0,
    },
    completedSwaps: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
