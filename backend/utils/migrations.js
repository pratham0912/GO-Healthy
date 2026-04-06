// utils/migrations.js — One-time startup index migrations (ESM)

import mongoose from 'mongoose';

/**
 * Drops the old non-sparse unique index on User.googleId so that
 * multiple documents without a googleId (email/password users) are allowed.
 * The Mongoose schema now defines googleId as sparse, so Mongoose will
 * recreate the correct index automatically after this drop.
 */
export const fixGoogleIdIndex = async () => {
  try {
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const indexes = await usersCollection.indexes();

    for (const idx of indexes) {
      // Find the old non-sparse unique index on googleId
      if (
        idx.key?.googleId !== undefined &&
        idx.unique === true &&
        !idx.sparse
      ) {
        await usersCollection.dropIndex(idx.name);
        console.log(`✅ Dropped stale googleId index: "${idx.name}"`);
      }
    }
  } catch (err) {
    // Non-fatal — log and continue
    console.warn(`⚠️  Migration fixGoogleIdIndex warning: ${err.message}`);
  }
};
