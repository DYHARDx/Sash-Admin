import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';
import { verifyFirebaseToken } from '@/lib/auth-jwt';

// Required for mongoose model registers
import '@/lib/models/Role';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await verifyFirebaseToken(sessionToken);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const firebaseUid = decodedToken.user_id || decodedToken.sub;
    const email = decodedToken.email;

    await connectDB();

    let admin = await Admin.findOne({ firebaseUid }).populate('role');

    // Linking logic: if admin document exists with email but firebaseUid isn't linked yet
    if (!admin && email) {
      admin = await Admin.findOne({ email }).populate('role');
      if (admin) {
        admin.firebaseUid = firebaseUid;
        await admin.save();
      }
    }

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
