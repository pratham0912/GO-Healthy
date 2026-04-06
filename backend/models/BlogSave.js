// models/BlogSave.js — Saved blog schema (ESM)

import mongoose from 'mongoose';

const BlogSaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    blogId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    sourceUrl: {
      type: String,
    },
    category: {
      type: String,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate saves — one user can save a blog only once
BlogSaveSchema.index({ userId: 1, blogId: 1 }, { unique: true });

const BlogSave = mongoose.model('BlogSave', BlogSaveSchema);
export default BlogSave;
