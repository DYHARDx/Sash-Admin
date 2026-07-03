import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  paymentId: string;
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  paymentMethod: 'UPI' | 'COD';
  amount: number;
  transactionId?: string;
  screenshotUrl?: string;
  upiId?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  verifiedBy?: mongoose.Types.ObjectId;
  verificationNotes?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    paymentMethod: { type: String, enum: ['UPI', 'COD'], required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String },
    screenshotUrl: { type: String },
    upiId: { type: String },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    verificationNotes: { type: String },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;
