import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SupportTicket from '@/lib/models/SupportTicket';
import Admin from '@/lib/models/Admin';
import { verifySessionToken } from '@/lib/auth-jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const ticket = await SupportTicket.findOne({ ticketId: id });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, messages: ticket.messages });
  } catch (error) {
    console.error('Fetch ticket messages error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminSessionToken = request.cookies.get('admin_session_token')?.value;

    if (!adminSessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await verifySessionToken(adminSessionToken);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    await connectDB();
    const admin = await Admin.findOne({ email: decodedToken.email });
    const senderName = admin ? admin.name : 'Admin Support';
    const senderId = admin ? admin._id.toString() : decodedToken.sub;

    const newMessage = {
      sender: 'Admin' as const,
      senderId,
      senderName,
      text,
      createdAt: new Date(),
    };

    const ticket = await SupportTicket.findOneAndUpdate(
      { ticketId: id },
      {
        $push: { messages: newMessage },
        status: 'In Progress',
      },
      { new: true }
    );

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Send ticket message error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
