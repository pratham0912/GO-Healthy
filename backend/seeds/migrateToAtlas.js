// seeds/migrateToAtlas.js — Copy all collections from local MongoDB to Atlas
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const LOCAL_URI = 'mongodb://localhost:27017/gohealthy';
const ATLAS_URI = process.env.MONGODB_URI;

const COLLECTIONS = ['recipes', 'users', 'blogs', 'mealplans', 'activities', 'waters', 'weights'];

async function migrate() {
  console.log('Connecting to local MongoDB...');
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('✅ Connected to local MongoDB');

  console.log('Connecting to Atlas...');
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('✅ Connected to Atlas\n');

  for (const collName of COLLECTIONS) {
    try {
      const localCol = localConn.db.collection(collName);
      const atlasCol = atlasConn.db.collection(collName);
      
      const docs = await localCol.find({}).toArray();
      
      if (docs.length === 0) {
        console.log(`⏭️  ${collName}: 0 documents (skipping)`);
        continue;
      }

      // Clear existing data in Atlas for this collection
      await atlasCol.deleteMany({});
      
      // Insert all documents
      await atlasCol.insertMany(docs);
      console.log(`✅ ${collName}: ${docs.length} documents migrated`);
    } catch (err) {
      console.log(`⚠️  ${collName}: ${err.message}`);
    }
  }

  console.log('\n🎉 Migration complete!');
  await localConn.close();
  await atlasConn.close();
}

migrate().catch(err => { console.error('❌', err.message); process.exit(1); });
