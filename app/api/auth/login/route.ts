import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';
import bcrypt from 'bcryptjs';
import { signSessionToken } from '@/lib/auth-jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password: rawPassword } = await request.json();

    if (!email || !rawPassword) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const password = rawPassword.trim();

    await connectDB();

    const admin = await Admin.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('role');
    
    if (!admin) {
      console.log('Login failed: Admin not found for email:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (admin.status !== 'active') {
      console.log('Login failed: Account suspended for email:', email);
      return NextResponse.json({ error: 'Account is suspended' }, { status: 403 });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password || '');
    if (!isValidPassword) {
      console.log('Login failed: Invalid password for email:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    console.log('Login successful for email:', email);

    // Generate JWT
    const token = await signSessionToken({
      userId: admin._id.toString(),
      email: admin.email,
      role: admin.role ? (admin.role._id ? admin.role._id.toString() : admin.role.toString()) : 'admin',
    });

    const response = NextResponse.json({ 
      success: true, 
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      } 
    });

    response.cookies.set({
      name: 'admin_session_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
