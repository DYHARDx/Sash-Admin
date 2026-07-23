import mongoose, { Schema, Document, Model } from 'mongoose';
import './Role'; // ensure Role schema is registered for populate
export interface IAdmin extends Document {
  password?: string;
  name: string;
  email: string;
  role: mongoose.Types.ObjectId;
  permissions: string[];
  status: 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema = new Schema(
  {
    password: { type: String, select: false },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    permissions: { type: [String], default: [] },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  },
  { timestamps: true }
);

const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
export default Admin;
