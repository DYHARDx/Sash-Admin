import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sash";

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;

    // First ensure the admin role exists
    const rolesCollection = db.collection('roles');
    let adminRole = await rolesCollection.findOne({ name: 'Admin' });
    
    if (!adminRole) {
      const result = await rolesCollection.insertOne({
        name: 'Admin',
        permissions: ['*'],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      adminRole = { _id: result.insertedId };
      console.log("Created Admin role.");
    }

    const email = "dyhard108@sash.in";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminsCollection = db.collection('admins');
    
    const existingAdmin = await adminsCollection.findOne({ email });
    if (existingAdmin) {
      console.log(`Admin ${email} already exists.`);
      process.exit(0);
    }

    const result = await adminsCollection.insertOne({
      name: 'Super Admin',
      email: email,
      password: hashedPassword,
      role: adminRole._id,
      permissions: ['*'],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("Admin user created successfully!");
    console.log("User ID:", result.insertedId);
    console.log("Email:", email);
    console.log("Password: password123");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating user:", error);
    process.exit(1);
  }
}

createAdmin();
