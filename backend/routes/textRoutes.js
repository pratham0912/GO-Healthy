// routes/textRoutes.js — Text Save Routes (ESM)

import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { saveText, getUserTexts, deleteText } from '../controllers/textController.js';

const router = Router();

// All text routes require authentication
router.use(protect);

// POST /api/text/save — Save text input
router.post('/save', saveText);

// GET /api/text/:userId — Get user's saved texts
router.get('/:userId', getUserTexts);

// DELETE /api/text/:id — Delete a text entry
router.delete('/:id', deleteText);

export default router;
