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

    const { name, email, role } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Name, Email, and Role are required' }, { status: 400 });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 400 });
    }

    const newAdmin = await Admin.create({
      name,
      email: email.toLowerCase(),
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
