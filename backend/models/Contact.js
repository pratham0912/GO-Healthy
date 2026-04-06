// models/Contact.js — Contact Form Schema (ESM)

import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Valid email required'] },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Contact', contactSchema);
