// routes/imageRoutes.js — Image Grid Routes (ESM)

import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { getAll, getCategories, create, remove } from '../controllers/imageController.js';

const router = Router();

// GET /api/images — Get all images, optional category filter (public)
router.get('/', getAll);

// GET /api/images/categories — Get all categories (public)
router.get('/categories', getCategories);

// POST /api/images — Add new image (admin)
router.post('/', protect, adminOnly, create);

// DELETE /api/images/:id — Delete image (admin)
router.delete('/:id', protect, adminOnly, remove);

export default router;
