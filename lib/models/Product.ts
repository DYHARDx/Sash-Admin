import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVariant {
  size: string;
  color: string;
  sku: string;
  price?: number;
  stock: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  stock: number;
  variants: IVariant[];
  paymentMethods: ('UPI' | 'COD')[];
  status: 'draft' | 'published' | 'out_of_stock';
  ratings: number;
  numReviews: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number },
  stock: { type: Number, required: true, default: 0 },
});

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    images: { type: [String], default: [] },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    stock: { type: Number, required: true, default: 0 },
    variants: { type: [VariantSchema], default: [] },
    paymentMethods: {
      type: [String],
      enum: ['UPI', 'COD'],
      default: ['UPI', 'COD'],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'out_of_stock'],
      default: 'draft',
    },
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
