// controllers/adminBlogController.js — Admin CRUD for shared blog content (ESM)
// Note: These are system-wide blog articles managed by admins.
// For user-saved blogs, see blogController.js (user-scoped saved blogs).

import Blog from '../models/Blog.js';

export const getAll = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = category && category !== 'all' ? { category } : {};
    const blogs = await Blog.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: blogs });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });
    res.json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { title, content, excerpt, category, author, image, tags } = req.body;
    const blog = await Blog.create({ title, content, excerpt, category, author, image, tags });
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true }).lean();
    if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });
    res.json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });
    res.json({ success: true, data: { message: 'Blog deleted' } });
  } catch (error) {
    next(error);
  }
};
