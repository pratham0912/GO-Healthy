// routes/auth.js — Auth routes (public, rate-limited)

import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimiter.js';
import { googleSignIn, registerUser, loginUser } from '../controllers/authController.js';

const router = Router();

// POST /api/auth/google    — Authenticate with Google ID token
router.post('/google', authLimiter, googleSignIn);

// POST /api/auth/register  — Email/password registration
router.post('/register', authLimiter, registerUser);

// POST /api/auth/login     — Email/password login
router.post('/login', authLimiter, loginUser);

export default router;

