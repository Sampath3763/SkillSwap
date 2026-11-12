import express from 'express';
import {
  submitReview,
  getReviews,
  getSwapReview,
} from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/submit', authMiddleware, submitReview);
router.get('/user/:userId', authMiddleware, getReviews);
router.get('/swap/:swapRequestId', authMiddleware, getSwapReview);

export default router;
