import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';
import { verifySessionToken } from '@/lib/auth-jwt';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    await connectDB();
    // Validate Super Admin role
    const currentAdmin = await Admin.findOne({ email: decodedToken.email }).populate('role');
    if (!currentAdmin || (currentAdmin.role as any)?.name !== 'Super Admin') {
      return NextResponse.json({ error: 'Access denied: Super Admin only' }, { status: 403 });
    }

    const { status, role } = await request.json();

    const staff = await Admin.findByIdAndUpdate(
      id,
      { status, role },
      { new: true }
    ).populate('role');

    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error('Update staff error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    await connectDB();
    // Validate Super Admin role
    const currentAdmin = await Admin.findOne({ email: decodedToken.email }).populate('role');
    if (!currentAdmin || (currentAdmin.role as any)?.name !== 'Super Admin') {
      return NextResponse.json({ error: 'Access denied: Super Admin only' }, { status: 403 });
    }

    const staff = await Admin.findByIdAndDelete(id);

    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
