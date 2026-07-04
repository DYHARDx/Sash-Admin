import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { verifyFirebaseToken } from '@/lib/auth-jwt';

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

    const { name, description, price, compareAtPrice, stock, category, images, variants, paymentMethods, status } =
      await request.json();

    if (!name || typeof price !== 'number' || typeof stock !== 'number' || !category) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    // Generate slug from name
    let baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const uniqueSuffix = Date.now().toString().slice(-6);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    await connectDB();
    const newProduct = await Product.create({
      name,
      slug,
      description,
      price,
      compareAtPrice,
      stock,
      category,
      images: images || [],
      variants: variants || [],
      paymentMethods: paymentMethods || ['UPI', 'COD'],
      status: status || 'draft',
      ratings: 0,
      numReviews: 0,
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
