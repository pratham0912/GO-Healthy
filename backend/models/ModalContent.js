// models/ModalContent.js — Dynamic Modal Schema (ESM)

import mongoose from 'mongoose';

const modalContentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  body: { type: String, required: true },
  type: { type: String, enum: ['announcement', 'health-tip', 'promo', 'alert', 'welcome'], default: 'health-tip' },
  active: { type: Boolean, default: true },
  icon: { type: String, default: 'bi-info-circle' },
  ctaText: { type: String, default: '' },
  ctaLink: { type: String, default: '' },
  priority: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('ModalContent', modalContentSchema);
