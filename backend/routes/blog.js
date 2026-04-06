// routes/blog.js — Saved blog routes (all protected)

import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getSavedBlogs,
  saveBlog,
  unsaveBlog,
  isBlogSaved,
} from '../controllers/blogController.js';

const router = Router();

// All saved-blog routes require authentication
router.use(protect);

// GET    /api/blogs/saved         — Get user's saved blogs (paginated)
router.get('/saved', getSavedBlogs);

// POST   /api/blogs/save          — Save a blog under the user
router.post('/save', saveBlog);

// GET    /api/blogs/saved/:blogId — Check if a specific blog is saved
router.get('/saved/:blogId', isBlogSaved);

// DELETE /api/blogs/save/:blogId  — Remove a saved blog
router.delete('/save/:blogId', unsaveBlog);

export default router;
