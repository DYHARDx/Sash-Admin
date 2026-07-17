import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';
import { verifySessionToken } from '@/lib/auth-jwt';

// Required for mongoose model registers
import '@/lib/models/Role';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await verifySessionToken(sessionToken);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decodedToken.userId;

    await connectDB();

    const admin = await Admin.findOne({ _id: userId }).populate('role');

    if (!admin) {
      return NextResponse.json({ error: 'Access denied: Admin record not found' }, { status: 403 });
    }

    if (admin.status === 'suspended') {
      return NextResponse.json({ error: 'Admin account suspended' }, { status: 403 });
    }

    return NextResponse.json({ success: true, admin });
  } catch (error) {
    console.error('Fetch admin profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
