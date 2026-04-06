// routes/modalRoutes.js — Modal Content Routes (ESM)

import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { getActiveModal, getAllModals, createModal } from '../controllers/modalController.js';

const router = Router();

// GET /api/modal-content — Get active modal (public)
router.get('/', getActiveModal);

// GET /api/modal-content/all — List all modals (admin)
router.get('/all', protect, adminOnly, getAllModals);

// POST /api/modal-content — Create modal (admin)
router.post('/', protect, adminOnly, createModal);

export default router;
