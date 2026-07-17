import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Banner from '@/lib/models/Banner';
import { verifySessionToken } from '@/lib/auth-jwt';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const banners = await Banner.find().sort({ position: 1, createdAt: -1 });
    return NextResponse.json({ success: true, banners });
  } catch (error) {
    console.error('Fetch banners error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminSessionToken = request.cookies.get('admin_session_token')?.value;

    if (!adminSessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await verifySessionToken(adminSessionToken);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, subtitle, imageUrl, linkUrl, bgText, bgColor, status, position } = await request.json();

    if (!imageUrl || !linkUrl || !title) {
      return NextResponse.json({ error: 'Title, Image URL, and Link URL are required' }, { status: 400 });
    }

    await connectDB();
    const newBanner = await Banner.create({
      title,
      subtitle,
      imageUrl,
      linkUrl,
      bgText,
      bgColor,
      status: status || 'active',
      position: position !== undefined ? Number(position) : 0,
    });

    return NextResponse.json({ success: true, banner: newBanner });
  } catch (error) {
    console.error('Create banner error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
