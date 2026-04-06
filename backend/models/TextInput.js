// models/TextInput.js — Text Save Schema (ESM)

import mongoose from 'mongoose';

const textInputSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 5000 },
    type: { type: String, enum: ['draft', 'submitted', 'note', 'feedback'], default: 'submitted' },
    characterCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('TextInput', textInputSchema);
