import express from 'express';
import {
  getProfile,
  updateProfile,
  addSkill,
  removeSkill,
  searchUsers,
  getUserById,
  changePassword,
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/skills', authMiddleware, addSkill);
router.delete('/skills', authMiddleware, removeSkill);
router.get('/search', authMiddleware, searchUsers);
router.get('/:userId', authMiddleware, getUserById);
router.put('/password', authMiddleware, changePassword);

export default router;
