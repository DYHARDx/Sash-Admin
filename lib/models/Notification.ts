import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  user?: mongoose.Types.ObjectId | null;
  title: string;
  message: string;
  type: 'order_status' | 'payment_status' | 'ticket_update' | 'promo' | 'general';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['order_status', 'payment_status', 'ticket_update', 'promo', 'general'],
      default: 'general',
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
