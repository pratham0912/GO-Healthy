// controllers/imageController.js — Image Grid (ESM)

import Image from '../models/Image.js';

export const getAll = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = {};
    if (category && category !== 'all') query.category = category;
    const images = await Image.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: images });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Image.distinct('category');
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { url, category, title, description } = req.body;
    const image = await Image.create({ url, category, title, description });
    res.status(201).json({ success: true, data: image });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const image = await Image.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).json({ success: false, error: 'Image not found' });
    res.json({ success: true, data: { message: 'Image deleted' } });
  } catch (error) {
    next(error);
  }
};
