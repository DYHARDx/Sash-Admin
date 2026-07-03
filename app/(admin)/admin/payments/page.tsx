'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Loader2, CreditCard, ExternalLink } from 'lucide-react';

interface PaymentRecord {
  _id: string;
  paymentId: string;
  order: {
    _id: string;
    orderId: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  paymentMethod: 'UPI' | 'COD';
  amount: number;
  transactionId?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments');
      const data = await res.json();
      if (res.ok) {
        setPayments(data.payments);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load payment transactions.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const query = searchQuery.toLowerCase();
    const txnMatch = p.transactionId ? p.transactionId.toLowerCase().includes(query) : false;
    const orderMatch = p.order ? p.order.orderId.toLowerCase().includes(query) : false;
    const paymentIdMatch = p.paymentId.toLowerCase().includes(query);
    const userMatch = p.user ? p.user.name.toLowerCase().includes(query) : false;
    
    const matchesSearch = txnMatch || orderMatch || paymentIdMatch || userMatch;
    const matchesStatus = statusFilter === '' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-xs text-gray-700 font-medium">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-3">
        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
          Payments Logs
        </h1>
        <p className="text-xs text-gray-500">Track consumer checkout transactions, UPI transfers, and payment approvals.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs font-semibold rounded">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-55 p-4 border border-gray-200 rounded">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by Payment ID, Order ID, or Transaction ID..."
            className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 pl-9 text-xs focus:border-black focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2 text-gray-400" size={14} />
        </div>

        <div className="flex gap-2 w-full sm:w-auto self-stretch sm:self-center shrink-0">
          <select
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-black focus:outline-none w-full sm:w-36 font-semibold"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading payments...</div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded text-gray-550 text-xs">
          No payment transactions found matching filters.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50 text-[9px] font-bold uppercase tracking-wider text-gray-655">
              <tr>
                <th className="px-6 py-3">Payment ID</th>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">UPI Ref ID</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-gray-650 font-medium">
              {filteredPayments.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-black" />
                    {p.paymentId}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{p.order?.orderId || '-'}</td>
                  <td className="px-6 py-4 truncate max-w-[120px]">{p.user?.name || 'Customer'}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">₹{p.amount}</td>
                  <td className="px-6 py-4 font-semibold">{p.paymentMethod}</td>
                  <td className="px-6 py-4 font-mono font-bold select-all text-black">{p.transactionId || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${
                      p.status === 'Approved'
                        ? 'bg-green-50 text-green-700 border-green-150'
                        : p.status === 'Rejected'
                        ? 'bg-red-50 text-red-700 border-red-150'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-150'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    {p.order && (
                      <Link
                        href={`/admin/orders/${p.order.orderId}`}
                        className="inline-flex items-center gap-0.5 bg-black hover:bg-gray-800 text-white font-bold py-1 px-2.5 rounded uppercase text-[9px] tracking-wide cursor-pointer"
                      >
                        Verify <ExternalLink size={10} />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
