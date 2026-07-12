import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl: string;
  bgText?: string;
  bgColor?: string;
  status: 'active' | 'inactive';
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String, required: true },
    bgText: { type: String },
    bgColor: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Banner: Model<IBanner> = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);
export default Banner;
