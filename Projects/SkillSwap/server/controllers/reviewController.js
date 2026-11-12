import Review from '../models/Review.js';
import User from '../models/User.js';
import SkillSwapRequest from '../models/SkillSwapRequest.js';

export const submitReview = async (req, res) => {
  try {
    const { swapRequestId, revieweeId, rating, feedback, skillQuality, communication, punctuality } = req.body;
    
    const swapRequest = await SkillSwapRequest.findById(swapRequestId);
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }
    
    // Check if user is part of this swap
    if (swapRequest.initiatorId.toString() !== req.userId && swapRequest.recipientId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to review this swap' });
    }
    
    // Check if already reviewed
    const existingReview = await Review.findOne({
      swapRequestId,
      reviewerId: req.userId,
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this swap' });
    }
    
    const review = new Review({
      swapRequestId,
      reviewerId: req.userId,
      revieweeId,
      rating,
      feedback,
      skillQuality,
      communication,
      punctuality,
    });
    
    await review.save();
    
    // Update user's average rating
    const reviewsForUser = await Review.find({ revieweeId });
    const averageRating = reviewsForUser.reduce((sum, r) => sum + r.rating, 0) / reviewsForUser.length;
    
    const user = await User.findById(revieweeId);
    user.averageRating = Math.round(averageRating * 10) / 10;
    user.totalReviews = reviewsForUser.length;
    await user.save();
    
    res.status(201).json({ message: 'Review submitted', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ revieweeId: userId })
      .populate('reviewerId', 'name profileImage')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSwapReview = async (req, res) => {
  try {
    const { swapRequestId } = req.params;
    const reviews = await Review.find({ swapRequestId })
      .populate('reviewerId', 'name profileImage');
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
