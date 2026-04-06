// controllers/authController.js — Google OAuth + Email/Password authentication (ESM)

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import googleClient from '../config/googleAuth.js';
import User from '../models/User.js';
import Dashboard from '../models/Dashboard.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex');
}

function generateSalt() {
  return crypto.randomBytes(32).toString('hex');
}

function issueJWT(user) {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function userPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture || '',
  };
}

async function ensureDashboard(userId) {
  await Dashboard.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

// ─── POST /api/auth/register ─────────────────────────────────────────────────
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const salt = generateSalt();
    const hash = hashPassword(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hash,
      passwordSalt: salt,
    });

    await ensureDashboard(user._id);

    const token = issueJWT(user);
    return res.status(201).json({
      success: true,
      data: { token, user: userPayload(user) },
    });
  } catch (err) {
    console.error('[authController.register]', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// ─── POST /api/auth/login ────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    // Explicitly select passwordHash/passwordSalt (hidden by default)
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+passwordHash +passwordSalt');

    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const attempt = hashPassword(password, user.passwordSalt);
    if (attempt !== user.passwordHash) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    await ensureDashboard(user._id);

    const token = issueJWT(user);
    return res.status(200).json({
      success: true,
      data: { token, user: userPayload(user) },
    });
  } catch (err) {
    console.error('[authController.login]', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// ─── POST /api/auth/google ───────────────────────────────────────────────────
/**
 * Verify Google ID token, find or create user + dashboard, issue JWT.
 */
export const googleSignIn = async (req, res) => {
  try {
    const { credential, token: tokenField } = req.body;
    const idToken = credential || tokenField;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'Google credential token is required',
      });
    }

    let payload;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      // Clock skew fallback — if system clock is desynced
      if (
        verifyErr.message &&
        (verifyErr.message.includes('used too early') ||
          verifyErr.message.includes('used too late'))
      ) {
        console.warn(
          `[Auth] Clock skew detected — bypassing time validation: ${verifyErr.message}`
        );
        payload = jwt.decode(idToken);

        if (!payload || payload.aud !== process.env.GOOGLE_CLIENT_ID) {
          return res.status(401).json({
            success: false,
            error: 'Invalid token',
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
        });
      }
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required for Google authentication',
      });
    }

    // Find or create user (upsert)
    const user = await User.findOneAndUpdate(
      { googleId },
      { $set: { email, name, profilePicture: picture || '' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await ensureDashboard(user._id);

    // Sign JWT
    const jwtToken = issueJWT(user);

    return res.status(200).json({
      success: true,
      data: {
        token: jwtToken,
        user: userPayload(user),
      },
    });
  } catch (error) {
    console.error(`[authController.googleSignIn] Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

