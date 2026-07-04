import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = match[2].replace(/^"|"$/g, '');
    }
  });
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const MONGODB_URI = process.env.MONGODB_URI;

async function setup() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const email = "admin_master@sash.in";
  const password = "password123";
  let uid = "";

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    uid = userCredential.user.uid;
    console.log(`Created Firebase Auth user ${email} with uid ${uid}`);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.error(`User ${email} already exists. Please choose a different email in this script.`);
      process.exit(1);
    } else {
      console.error("Firebase error:", error);
      process.exit(1);
    }
  }

  // Find Super Admin role
  const Role = mongoose.models.Role || mongoose.model('Role', new mongoose.Schema({}, { strict: false }));
  const superAdminRole = await Role.findOne({ name: 'Super Admin' });
  if (!superAdminRole) {
    console.error("Super Admin role not found in DB! Run seed-roles.js first.");
    process.exit(1);
  }

  const AdminSchema = new mongoose.Schema({
    firebaseUid: { type: String, unique: true },
    name: { type: String },
    email: { type: String, unique: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    permissions: { type: [String], default: [] },
    status: { type: String }
  });
  const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

  await Admin.create({
    firebaseUid: uid,
    name: 'Master Admin',
    email: email,
    role: superAdminRole._id,
    permissions: [],
    status: 'active'
  });

  console.log(`\n✅ Setup complete!`);
  console.log(`You can now login to Sash-Admin with:`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}\n`);
  
  process.exit(0);
}

setup();
