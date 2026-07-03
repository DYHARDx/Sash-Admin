import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';
import Admin from '@/lib/models/Admin';
import { verifyFirebaseToken } from '@/lib/auth-jwt';
import '@/lib/models/Role';

const CONFIG_KEY = 'store_config';

const defaultSettings = {
  storeName: 'SASH',
  upiId: 'dyhardx@okaxis',
  upiMerchantName: 'Sash Clothing',
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const configRecord = await Settings.findOne({ key: CONFIG_KEY });
    const config = configRecord ? configRecord.value : defaultSettings;

    return NextResponse.json({ success: true, settings: config });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminSessionToken = request.cookies.get('admin_session_token')?.value;

    if (!adminSessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await verifyFirebaseToken(adminSessionToken);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    // Validate Super Admin role
    const admin = await Admin.findOne({ email: decodedToken.email }).populate('role');
    if (!admin || (admin.role as any)?.name !== 'Super Admin') {
      return NextResponse.json({ error: 'Access denied: Super Admin only' }, { status: 403 });
    }

    const { storeName, upiId, upiMerchantName } = await request.json();

    if (!storeName || !upiId || !upiMerchantName) {
      return NextResponse.json({ error: 'All configuration fields are required' }, { status: 400 });
    }

    const updatedConfig = await Settings.findOneAndUpdate(
      { key: CONFIG_KEY },
      { key: CONFIG_KEY, value: { storeName, upiId, upiMerchantName } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, settings: updatedConfig.value });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
