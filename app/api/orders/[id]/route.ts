import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Payment from '@/lib/models/Payment';
import { verifyFirebaseToken } from '@/lib/auth-jwt';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const order = await Order.findOne({ orderId: id })
      .populate('paymentDetails')
      .populate('items.product')
      .lean();
      
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderData = { ...order } as any;
    if (orderData.paymentDetails) {
      orderData.transactionId = orderData.paymentDetails.transactionId;
      orderData.receiptUrl = orderData.paymentDetails.receiptUrl;
    }
    
    if (orderData.items) {
      orderData.items = orderData.items.map((item: any) => ({
        ...item,
        image: item.product?.images?.[0] || ''
      }));
    }

    return NextResponse.json({ success: true, order: orderData });
  } catch (error) {
    console.error('Fetch order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const adminSessionToken = request.cookies.get('admin_session_token')?.value;

    if (!adminSessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await verifyFirebaseToken(adminSessionToken);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let { status, paymentStatus } = await request.json();
    let dbPaymentStatus = paymentStatus;
    if (paymentStatus === 'Paid') dbPaymentStatus = 'Approved';
    if (paymentStatus === 'Failed') dbPaymentStatus = 'Rejected';

    await connectDB();
    const order = await Order.findOneAndUpdate(
      { orderId: id },
      { status, paymentStatus: dbPaymentStatus },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentDetails) {
      const pStatus = paymentStatus === 'Paid' ? 'Approved' : paymentStatus === 'Failed' ? 'Rejected' : 'Pending';
      await Payment.findByIdAndUpdate(order.paymentDetails, { status: pStatus });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
