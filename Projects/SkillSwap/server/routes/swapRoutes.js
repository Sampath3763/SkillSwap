import express from 'express';
import {
  createSwapRequest,
  respondToSwapRequest,
  getSwapRequests,
  getPotentialMatches,
  completeSwap,
  generateMeetingLink,
} from '../controllers/swapController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/request', authMiddleware, createSwapRequest);
router.post('/request/respond', authMiddleware, respondToSwapRequest);
router.get('/requests', authMiddleware, getSwapRequests);
router.get('/matches', authMiddleware, getPotentialMatches);
router.post('/complete', authMiddleware, completeSwap);
router.post('/meeting-link', authMiddleware, generateMeetingLink);

export default router;
