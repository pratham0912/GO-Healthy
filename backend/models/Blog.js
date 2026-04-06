// models/Blog.js — Admin Blog Schema (ESM)
// Note: This is the SHARED blog content model (admin-managed).
// For user-saved blogs, see BlogSave.js

import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true },
    excerpt: { type: String, maxlength: 300 },
    category: {
      type: String,
      required: true,
      enum: ['nutrition', 'fitness', 'mental-health', 'recipes', 'wellness', 'weight-loss', 'muscle-gain'],
      default: 'nutrition',
    },
    author: { type: String, required: true, default: 'GoHealthy Team' },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80',
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export default mongoose.model('Blog', blogSchema);
