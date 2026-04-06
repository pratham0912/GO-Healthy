// models/Image.js — Image Grid Schema (ESM)

import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  category: { type: String, required: true, enum: ['fitness', 'nutrition', 'yoga', 'recipes', 'mental-health', 'wellness'], default: 'wellness' },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, default: '', maxlength: 300 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Image', imageSchema);
