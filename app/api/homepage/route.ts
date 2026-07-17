import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';
import Admin from '@/lib/models/Admin';
import { verifySessionToken } from '@/lib/auth-jwt';
import '@/lib/models/Role';

const CONFIG_KEY = 'homepage_config';

const defaultHomepageConfig = {
  categories: [
    { key: 'men', label: 'MEN', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80' },
    { key: 'women', label: 'WOMEN', image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&auto=format&fit=crop&q=80' },
    { key: 'accessories', label: 'ACCESSORIES', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80' },
  ],
  newSeason: {
    backImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600',
    frontImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600',
    title: 'New Season Collection',
    description: 'Refresh your wardrobe with our newest collection, where contemporary trends meet timeless elegance in pieces you\'ll reach for season after season.'
  },
  promo: {
    leftImage: 'https://freepngimg.com/thumb/fashion/3-2-fashion-model-transparent.png',
    rightImage: 'https://www.pngall.com/wp-content/uploads/5/Model-Man-PNG.png',
    title: 'Free Shipping on Orders ₹999+',
    code: 'SASHFREE'
  },
  about: {
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=800',
    title: 'KNOW SASHVOGUE',
    description: 'Fueled by a deep-rooted passion, SashVOGUE\'s journey reflects our fearless ambition to redefine modern menswear and womenswear on a global scale. We bring quality, utility, and timeless garments directly to you.',
    instagramUrl: 'https://www.instagram.com/sashvogue.in'
  }
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const configRecord = await Settings.findOne({ key: CONFIG_KEY });
    const config = configRecord ? configRecord.value : defaultHomepageConfig;

    return NextResponse.json({ success: true, settings: config });
  } catch (error) {
    console.error('Fetch homepage config error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
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
    const admin = await Admin.findOne({ email: decodedToken.email }).populate('role');
    if (!admin || (admin.role as any)?.name !== 'Super Admin') {
      return NextResponse.json({ error: 'Access denied: Super Admin only' }, { status: 403 });
    }

    const newConfig = await request.json();

    const updatedConfig = await Settings.findOneAndUpdate(
      { key: CONFIG_KEY },
      { key: CONFIG_KEY, value: newConfig },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, settings: updatedConfig.value });
  } catch (error) {
    console.error('Update homepage config error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
