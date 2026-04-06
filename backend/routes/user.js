// routes/user.js — User profile routes (protected)

import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getProfile, updateProfile, getBMI } from '../controllers/userController.js';

const router = Router();

// All user routes require authentication
router.use(protect);

// GET  /api/user/profile — Get logged-in user's profile (incl. health fields)
router.get('/profile', getProfile);

// PUT  /api/user/profile — Update profile (name, age, height, weight, goal, etc.)
router.put('/profile', updateProfile);

// GET  /api/user/bmi     — Calculate and return BMI
router.get('/bmi', getBMI);

export default router;
