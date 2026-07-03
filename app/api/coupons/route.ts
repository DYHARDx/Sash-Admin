import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/lib/models/Coupon';
import { verifyFirebaseToken } from '@/lib/auth-jwt';

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
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    console.error('Fetch coupons error:', error);
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

    const { code, discountType, discountValue, minOrderValue, maxDiscountAmount, expiryDate, usageLimit, status } =
      await request.json();

    if (!code || !discountType || typeof discountValue !== 'number') {
      return NextResponse.json({ error: 'Code, Discount Type, and Value are required' }, { status: 400 });
    }

    const now = new Date();
    const expiry = expiryDate ? new Date(expiryDate) : new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    await connectDB();
    const newCoupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscount: maxDiscountAmount || undefined,
      startDate: now,
      endDate: expiry,
      usageLimit: usageLimit !== undefined ? Number(usageLimit) : undefined,
      status: status === 'inactive' ? 'disabled' : status || 'active',
    });

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (error) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
