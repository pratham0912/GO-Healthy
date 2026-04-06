// config/db.js — MongoDB connection with error handling (ESM)

import mongoose from 'mongoose';
import { fixGoogleIdIndex } from '../utils/migrations.js';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Run one-time startup migrations (non-fatal)
    await fixGoogleIdIndex();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

