// models/CurrencyHistory.js — Conversion History (ESM)

import mongoose from 'mongoose';

const currencyHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  from: { type: String, required: true, uppercase: true, trim: true },
  to: { type: String, required: true, uppercase: true, trim: true },
  amount: { type: Number, required: true },
  rate: { type: Number, required: true },
  result: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('CurrencyHistory', currencyHistorySchema);
