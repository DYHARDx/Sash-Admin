import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  googleId?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: mongoose.Types.ObjectId;
  status: 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    googleId: { type: String, sparse: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: { type: String },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
