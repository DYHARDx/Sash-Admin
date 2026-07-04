import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';
import { verifyFirebaseToken } from '@/lib/auth-jwt';
import '@/lib/models/Role';

export async function GET(request: NextRequest) {
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
    const currentAdmin = await Admin.findOne({ email: decodedToken.email }).populate('role');
    if (!currentAdmin || (currentAdmin.role as any)?.name !== 'Super Admin') {
      return NextResponse.json({ error: 'Access denied: Super Admin only' }, { status: 403 });
    }

    const staff = await Admin.find().populate('role').sort({ createdAt: -1 });

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error('Fetch staff error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const currentAdmin = await Admin.findOne({ email: decodedToken.email }).populate('role');
    if (!currentAdmin || (currentAdmin.role as any)?.name !== 'Super Admin') {
      return NextResponse.json({ error: 'Access denied: Super Admin only' }, { status: 403 });
    }

    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Name, Email, Password, and Role are required' }, { status: 400 });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Firebase API key is missing.' }, { status: 500 });
    }

    const firebaseRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.toLowerCase(),
        password,
        returnSecureToken: false,
      }),
    });

    const firebaseData = await firebaseRes.json();

    if (!firebaseRes.ok) {
      console.error('Firebase Auth creation failed:', firebaseData);
      return NextResponse.json(
        { error: firebaseData.error?.message || 'Failed to create user in Firebase Auth.' },
        { status: 400 }
      );
    }

    const firebaseUid = firebaseData.localId;

    const newAdmin = await Admin.create({
      name,
      email: email.toLowerCase(),
      firebaseUid,
      role,
      status: 'active',
      permissions: [],
    });

    const populatedAdmin = await Admin.findById(newAdmin._id).populate('role');

    return NextResponse.json({ success: true, admin: populatedAdmin });
  } catch (error) {
    console.error('Create staff error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
