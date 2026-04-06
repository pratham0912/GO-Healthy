// routes/blogRoutes.js — Admin blog CRUD routes (ESM)
// Note: This serves SHARED/admin-managed blog articles (public read, admin write).
// For user-saved blogs, see routes/blog.js → /api/blogs/saved

import { Router } from 'express';
import { body } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { getAll, getById, create, update, remove } from '../controllers/adminBlogController.js';

const router = Router();

// Public — anyone can read blog articles
router.get('/', getAll);
router.get('/:id', getById);

// Protected — admin only for write operations
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('category').notEmpty().withMessage('Category is required'),
    handleValidation,
  ],
  create
);

router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);

export default router;
