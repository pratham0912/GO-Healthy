// middleware/auth.js — JWT verification middleware (most critical file in the system)

import jwt from 'jsonwebtoken';

/**
 * Protects routes by verifying JWT from Authorization header.
 * Attaches req.user = { id, email } on success.
 * Usage: router.get('/protected', protect, handler)
 */
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach minimal user info — never the full document
    req.user = {
      id: decoded.userId || decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

/**
 * Admin-only middleware — use after protect.
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: 'Access denied — admin only',
  });
};
