// routes/currencyRoutes.js — Currency Converter Routes (ESM)

import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { convert, getRates, getHistory } from '../controllers/currencyController.js';
import jwt from 'jsonwebtoken';

const router = Router();

// Middleware to optionally attach user (non-blocking)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId || decoded.id, email: decoded.email };
      }
    }
  } catch (_) {
    // Not logged in — that's fine
  }
  next();
};

// GET /api/currency/convert?from=USD&to=INR&amount=100 — Convert (public, optional auth)
router.get('/convert', optionalAuth, convert);

// GET /api/currency/rates?base=USD — Get all rates (public)
router.get('/rates', getRates);

// GET /api/currency/history — Get user's conversion history (protected)
router.get('/history', protect, getHistory);

export default router;
