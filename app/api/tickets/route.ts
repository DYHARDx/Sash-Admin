import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SupportTicket from '@/lib/models/SupportTicket';
import { verifySessionToken } from '@/lib/auth-jwt';

export async function GET(request: NextRequest) {
  try {
    const adminSessionToken = request.cookies.get('admin_session_token')?.value;

    if (!adminSessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await verifySessionToken(adminSessionToken);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error('Fetch tickets error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
