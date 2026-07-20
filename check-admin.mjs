import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const admin = await db.collection('admins').findOne({ email: 'dyhard108@sash.in' });
  console.log('Admin:', admin);
  process.exit(0);
}

run();
