import mongoose from 'mongoose';

const WeightEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg',
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

WeightEntrySchema.index({ userId: 1, loggedAt: -1 });

export default mongoose.model('WeightEntry', WeightEntrySchema);
