import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const hashedPassword = await bcrypt.hash('113114', 10);
  await db.collection('admins').updateOne(
    { email: 'dyhard108@sash.in' },
    { $set: { password: hashedPassword } }
  );
  console.log('Password updated successfully for dyhard108@sash.in');
  process.exit(0);
}

run();
