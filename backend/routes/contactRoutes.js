// routes/contactRoutes.js — Contact API Routes (ESM)

import { Router } from 'express';
import { body } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { submitContact, getAllMessages } from '../controllers/contactController.js';

const router = Router();

// POST /api/contact — Submit contact form (public)
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
    handleValidation,
  ],
  submitContact
);

// GET /api/contact — View all messages (admin only)
router.get('/', protect, adminOnly, getAllMessages);

export default router;
