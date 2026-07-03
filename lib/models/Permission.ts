import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  module: string;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    module: { type: String, required: true },
  },
  { timestamps: true }
);

const Permission: Model<IPermission> = mongoose.models.Permission || mongoose.model<IPermission>('Permission', PermissionSchema);
export default Permission;
