import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage {
  sender: 'User' | 'Admin';
  senderId: string;
  senderName: string;
  text: string;
  fileUrl?: string;
  createdAt: Date;
}

export interface ISupportTicket extends Document {
  ticketId: string;
  user: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  department?: string;
  status: 'Open' | 'In Progress' | 'Closed';
  assignedTo?: mongoose.Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  sender: { type: String, enum: ['User', 'Admin'], required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  fileUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const SupportTicketSchema: Schema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    department: { type: String },
    status: { type: String, enum: ['Open', 'In Progress', 'Closed'], default: 'Open' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Admin' },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

const SupportTicket: Model<ISupportTicket> = mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
export default SupportTicket;
