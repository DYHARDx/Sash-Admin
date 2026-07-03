import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { verifyFirebaseToken } from '@/lib/auth-jwt';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 });
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Fetch categories error:', error);
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

    const { name, slug, description, parentCategory } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    await connectDB();
    const newCategory = await Category.create({
      name,
      slug: slug.toLowerCase(),
      description,
      parent: parentCategory || null,
      status: 'active',
    });

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
