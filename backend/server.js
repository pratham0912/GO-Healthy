// server.js — Go Healthy application entry point (ESM)

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// ── New user-scoped routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import dashboardRoutes from './routes/dashboard.js';
import activityRoutes from './routes/activity.js';
import blogRoutes from './routes/blog.js';              // user-scoped saved blogs
import adminBlogRoutes from './routes/blogRoutes.js';    // admin CMS blog articles
import mealRoutes from './routes/meals.js';
import weightRoutes from './routes/weight.js';
import waterRoutes from './routes/water.js';
// ── Recipe API (new — replaces api_2)
import recipeRoutes from './routes/recipeRoutes.js';
import mealplanRoutes from './routes/mealplan.js';
// ── Preserved auxiliary routes (now ESM)
import contactRoutes from './routes/contactRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import modalRoutes from './routes/modalRoutes.js';
import textRoutes from './routes/textRoutes.js';

// Load env vars BEFORE any other config
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ESM __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,       // allow CDN scripts on the HTML frontend
    crossOriginEmbedderPolicy: false,   // allow external embeds (YouTube, Google images)
    crossOriginOpenerPolicy: false,     // MUST be false for Google Sign-In popup to work
  })
);

// ── CORS — only allow configured origin
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// ── Body parsing
app.use(express.json({ limit: '10kb' }));  // prevent large payload attacks

// ── Serve frontend static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, '..')));
// ── Serve uploaded recipe images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ══════════════════════════════════════════
// API ROUTES
// ══════════════════════════════════════════

// Public
app.use('/api/auth', authRoutes);

// Protected — user-scoped
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/blogs', blogRoutes);                // /api/blogs/saved, /api/blogs/save (user-scoped)
app.use('/api/blogs', adminBlogRoutes);            // /api/blogs (admin CMS articles)
app.use('/api/meals', mealRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/water', waterRoutes);
// Recipes
app.use('/api/recipes', recipeRoutes);
// Meal Plan
app.use('/api/mealplan', mealplanRoutes);
// Auxiliary
app.use('/api/contact', contactRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/modal-content', modalRoutes);
app.use('/api/text', textRoutes);

// Health check (useful for deployment monitoring)
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'ok', environment: process.env.NODE_ENV || 'development' },
  });
});

// 404 for unknown API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Global error handler (must be last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;
