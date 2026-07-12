'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Check, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';

interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  variant?: {
    size?: string;
    color?: string;
  };
}

interface Order {
  _id: string;
  orderId: string;
  user: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    email?: string;
  };
  totalPrice: number;
  couponCode?: string;
  discountAmount?: number;
  paymentMethod: 'UPI' | 'COD';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Approved' | 'Rejected';
  transactionId?: string;
  receiptUrl?: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id: orderId } = use(params);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [updateLoading, setUpdateLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data.order);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string, newPaymentStatus?: string) => {
    setUpdateLoading(true);
    setError('');
    setFeedback('');
    
    const payload = {
      status: newStatus,
      paymentStatus: newPaymentStatus || order?.paymentStatus
    };

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOrder(data.order);
      setFeedback('Order status updated successfully.');
      setTimeout(() => setFeedback(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update order status.');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm font-semibold text-red-600">{error || 'Order not found.'}</p>
        <Link href="/admin/orders" className="inline-block bg-black text-white text-xs font-bold px-6 py-2.5 rounded uppercase tracking-wider">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs text-gray-700 font-medium">
      
      {/* Top Navigation */}
      <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
        <div className="space-y-1">
          <Link href="/admin/orders" className="text-[10px] font-bold text-gray-500 hover:text-black uppercase tracking-wider flex items-center gap-1 mb-1">
            <ArrowLeft size={10} /> Back to Desk
          </Link>
          <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
            Order {order.orderId}
          </h1>
          <p className="text-[9px] text-gray-400">Placed on: {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div className="flex gap-2">
          <span className={`text-[9px] font-bold uppercase px-3 py-1 rounded border ${
            order.status === 'Delivered'
              ? 'bg-green-50 text-green-700 border-green-150'
              : order.status === 'Cancelled'
              ? 'bg-red-50 text-red-700 border-red-150'
              : 'bg-yellow-50 text-yellow-700 border-yellow-150'
          }`}>
            Fulfillment: {order.status}
          </span>
          <span className={`text-[9px] font-bold uppercase px-3 py-1 rounded border ${
            order.paymentStatus === 'Paid'
              ? 'bg-green-50 text-green-700 border-green-150'
              : 'bg-yellow-50 text-yellow-700 border-yellow-150'
          }`}>
            Payment: {order.paymentStatus}
          </span>
        </div>
      </div>

      {feedback && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 text-xs font-semibold rounded flex items-center gap-2">
          <Check size={14} /> {feedback}
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Items & Payment verification) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order items lists */}
          <div className="p-4 border border-gray-200 rounded space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">Line Items</h3>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 py-3 first:pt-0 last:pb-0 items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <img src={item.image} alt="" className="w-12 h-12 object-cover rounded border border-gray-200 bg-gray-50" />
                    <div>
                      <p className="font-bold text-gray-900">{item.name}</p>
                      {(item.variant?.size || item.size || item.variant?.color || item.color) && (
                        <div className="flex gap-1.5 items-center mt-1.5">
                          {(item.variant?.size || item.size) && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded">Size: {item.variant?.size || item.size}</span>}
                          {(item.variant?.color || item.color) && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded">Color: {item.variant?.color || item.color}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{item.price}</p>
                    <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal summary */}
            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-right font-medium">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₹{order.totalPrice + (order.discountAmount || 0)}</span>
              </div>
              {order.discountAmount && (
                <div className="flex justify-between text-green-700">
                  <span>Discount ({order.couponCode})</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-gray-900 pt-1.5 border-t border-gray-100">
                <span>Total Charged</span>
                <span>₹{order.totalPrice}</span>
              </div>
            </div>
          </div>

          {/* UPI Reference Verification Panel */}
          {order.paymentMethod === 'UPI' && (
            <div className="p-4 border border-gray-200 rounded space-y-4 bg-gray-50">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-2">
                UPI Reference Verification
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="block text-[9px] font-bold text-gray-450 uppercase">Transaction Reference ID</span>
                    <span className="text-xs font-mono font-bold text-black select-all bg-white px-2 py-1 border border-gray-200 rounded inline-block mt-0.5">
                      {order.transactionId || 'None'}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[9px] font-bold text-gray-450 uppercase">Payment Status</span>
                    <span className="text-xs font-bold text-black flex items-center gap-1 mt-0.5">
                      {order.paymentStatus === 'Paid' || order.paymentStatus === 'Approved' ? (
                        <>
                          <ShieldCheck className="text-green-600" size={16} /> Approved
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="text-yellow-600" size={16} /> Verification Pending
                        </>
                      )}
                    </span>
                  </div>

                  {/* Verification action buttons */}
                  {order.paymentStatus === 'Pending' && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleUpdateStatus('Processing', 'Paid')}
                        disabled={updateLoading}
                        className="bg-black hover:bg-gray-800 text-white font-bold text-[10px] px-3 py-2 rounded uppercase tracking-wider cursor-pointer disabled:opacity-50"
                      >
                        Approve Payment
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('Cancelled', 'Failed')}
                        disabled={updateLoading}
                        className="border border-red-200 hover:bg-red-50 text-red-600 font-bold text-[10px] px-3 py-2 rounded uppercase tracking-wider cursor-pointer disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>


              </div>
            </div>
          )}

        </div>

        {/* Right Column (Fulfillment controls & Address info) */}
        <div className="space-y-6">
          
          {/* Order fulfillment status controller */}
          <div className="p-4 border border-gray-200 rounded space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">Fulfillment Controller</h3>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase">Update Status</label>
              <select
                disabled={updateLoading}
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none text-xs"
                value={order.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Delivery destination details */}
          <div className="p-4 border border-gray-200 rounded space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">Delivery Address</h3>
            
            <div className="space-y-2 text-xs leading-relaxed text-gray-600 font-medium">
              <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
              <p>
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
              </p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <div className="border-t border-gray-100 pt-2 space-y-0.5">
                <p>Phone: {order.shippingAddress.phoneNumber}</p>
                {order.shippingAddress.email && <p>Email: {order.shippingAddress.email}</p>}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
