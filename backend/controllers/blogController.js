// controllers/blogController.js — User-scoped saved blogs CRUD (ESM)

import BlogSave from '../models/BlogSave.js';
import Dashboard from '../models/Dashboard.js';

/**
 * GET /api/blogs/saved
 * Get user's saved blogs — paginated.
 */
export const getSavedBlogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const [blogs, total] = await Promise.all([
      BlogSave.find({ userId })
        .sort({ savedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      BlogSave.countDocuments({ userId }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        blogs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error(`[blogController.getSavedBlogs] Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * POST /api/blogs/save
 * Save a blog under the user — upsert to prevent duplicates.
 */
export const saveBlog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { blogId, title, excerpt, imageUrl, sourceUrl, category } = req.body;

    if (!blogId || !title) {
      return res.status(400).json({
        success: false,
        error: 'blogId and title are required',
      });
    }

    const saved = await BlogSave.findOneAndUpdate(
      { userId, blogId },
      {
        $set: { title, excerpt, imageUrl, sourceUrl, category },
        $setOnInsert: { userId, blogId, savedAt: new Date() },
      },
      { upsert: true, new: true }
    );

    // Push to dashboard savedBlogs if not already present
    await Dashboard.findOneAndUpdate(
      { userId, savedBlogs: { $ne: saved._id } },
      { $push: { savedBlogs: saved._id } }
    );

    return res.status(201).json({
      success: true,
      data: saved.toObject(),
    });
  } catch (error) {
    console.error(`[blogController.saveBlog] Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * DELETE /api/blogs/save/:blogId
 * Remove a saved blog — userId check is mandatory.
 */
export const unsaveBlog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { blogId } = req.params;

    const removed = await BlogSave.findOneAndDelete({ blogId, userId });

    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'Saved blog not found',
      });
    }

    // Remove from dashboard savedBlogs
    await Dashboard.findOneAndUpdate(
      { userId },
      { $pull: { savedBlogs: removed._id } }
    );

    return res.status(200).json({
      success: true,
      data: { message: 'Blog unsaved' },
    });
  } catch (error) {
    console.error(`[blogController.unsaveBlog] Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * GET /api/blogs/saved/:blogId
 * Check if a specific blog is saved by the user.
 */
export const isBlogSaved = async (req, res) => {
  try {
    const userId = req.user.id;
    const { blogId } = req.params;

    const exists = await BlogSave.findOne({ userId, blogId })
      .select('_id')
      .lean();

    return res.status(200).json({
      success: true,
      data: { saved: !!exists },
    });
  } catch (error) {
    console.error(`[blogController.isBlogSaved] Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
