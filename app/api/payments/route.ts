import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/lib/models/Payment';
import { verifySessionToken } from '@/lib/auth-jwt';
import '@/lib/models/User';
import '@/lib/models/Order';

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
    const payments = await Payment.find()
      .populate('user')
      .populate('order')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, payments });
  } catch (error) {
    console.error('Fetch payments logs error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
