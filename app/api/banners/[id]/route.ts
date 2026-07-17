import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Banner from '@/lib/models/Banner';
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

    const { title, subtitle, imageUrl, linkUrl, bgText, bgColor, status, position } = await request.json();

    await connectDB();
    const banner = await Banner.findByIdAndUpdate(
      id,
      { title, subtitle, imageUrl, linkUrl, bgText, bgColor, status, position },
      { new: true }
    );

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error('Update banner error:', error);
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
    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Delete banner error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
