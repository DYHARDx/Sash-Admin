const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Simple dotenv parser to load Sash-Admin/.env manually without installing extra node packages
const envPath = path.join(__dirname, '..', 'Sash-Admin', '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Remove surrounding quotes if any
      if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside Sash-Admin/.env");
  process.exit(1);
}

// Define inline schemas to avoid ES module import issues in pure Node
const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: { type: [String], default: [] },
}, { timestamps: true });

const AdminSchema = new mongoose.Schema({
  firebaseUid: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  permissions: { type: [String], default: [] },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
}, { timestamps: true });

const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

const permissionsList = [
  'products:read', 'products:write',
  'orders:read', 'orders:write',
  'payments:read', 'payments:write',
  'users:read', 'users:write',
  'support:read', 'support:write',
  'analytics:read',
  'blogs:read', 'blogs:write',
  'coupons:read', 'coupons:write',
  'settings:read', 'settings:write',
  'banners:read', 'banners:write'
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    // 1. Seed Roles
    const customerRole = await Role.findOneAndUpdate(
      { name: 'Customer' },
      { name: 'Customer', permissions: [] },
      { upsert: true, new: true }
    );
    console.log("Customer Role seeded.");

    const adminPermissions = permissionsList.filter(p => !p.startsWith('settings:') && p !== 'payments:write');
    const adminRole = await Role.findOneAndUpdate(
      { name: 'Admin' },
      { name: 'Admin', permissions: adminPermissions },
      { upsert: true, new: true }
    );
    console.log("Admin Role seeded.");

    const superAdminRole = await Role.findOneAndUpdate(
      { name: 'Super Admin' },
      { name: 'Super Admin', permissions: permissionsList },
      { upsert: true, new: true }
    );
    console.log("Super Admin Role seeded.");

    // 2. Seed Bootstrap Super Admin User
    const superAdminEmail = 'dyhard108@sash.in';
    const existingAdmin = await Admin.findOne({ email: superAdminEmail });

    if (!existingAdmin) {
      await Admin.create({
        name: 'Super Admin',
        email: superAdminEmail,
        role: superAdminRole._id,
        permissions: [],
        status: 'active'
      });
      console.log(`Created bootstrap Super Admin user with email: ${superAdminEmail}`);
      console.log("Note: On first login with this email in Sash-Admin, the Firebase UID will be linked.");
    } else {
      console.log(`Super Admin user with email ${superAdminEmail} already exists.`);
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
