'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Check, Loader2, Gift } from 'lucide-react';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  endDate?: string;
  usageLimit?: number;
  usedCount: number;
  status: 'active' | 'expired' | 'disabled';
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [minOrderValue, setMinOrderValue] = useState(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState(0);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      if (res.ok) {
        setCoupons(data.coupons);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (c: Coupon) => {
    setEditId(c._id);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMinOrderValue(c.minOrderValue || 0);
    setMaxDiscountAmount(c.maxDiscount || 0);
    setExpiryDate(c.endDate ? c.endDate.split('T')[0] : '');
    setUsageLimit(c.usageLimit || 0);
    setStatus(c.status === 'disabled' ? 'inactive' : 'active');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    setError('');
    setFeedback('');
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback('Coupon deleted successfully.');
      fetchCoupons();
    } catch (e: any) {
      setError(e.message || 'Failed to delete coupon.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFeedback('');
    setFormLoading(true);

    const payload = {
      code,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      expiryDate: expiryDate || undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      status
    };

    try {
      const url = editId ? `/api/coupons/${editId}` : '/api/coupons';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback(editId ? 'Coupon updated successfully.' : 'New coupon created successfully.');
      setShowForm(false);
      setEditId(null);
      setCode('');
      setDiscountValue(0);
      setMinOrderValue(0);
      setMaxDiscountAmount(0);
      setExpiryDate('');
      setUsageLimit(0);
      setStatus('active');
      fetchCoupons();
    } catch (err: any) {
      setError(err.message || 'Failed to save coupon.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-xs text-gray-700 font-medium">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
            Coupons Desk
          </h1>
          <p className="text-xs text-gray-500">Configure catalog discount coupon codes, usage limits, and expiries.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditId(null);
              setCode('');
              setDiscountValue(0);
              setMinOrderValue(0);
              setMaxDiscountAmount(0);
              setExpiryDate('');
              setUsageLimit(0);
              setStatus('active');
              setShowForm(true);
            }}
            className="flex items-center gap-1 bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded uppercase tracking-wider cursor-pointer"
          >
            <Plus size={14} /> Create Coupon
          </button>
        )}
      </div>

      {feedback && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 text-xs font-semibold rounded flex items-center gap-2">
          <Check size={14} /> {feedback}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs font-semibold rounded">
          {error}
        </div>
      )}

      {/* Form Dialog Box */}
      {showForm ? (
        <form onSubmit={handleFormSubmit} className="bg-gray-55 p-6 border border-gray-200 rounded space-y-4 max-w-xl">
          <h3 className="font-bold text-gray-900 uppercase text-[10px] tracking-wide border-b border-gray-150 pb-2">
            {editId ? 'Edit Coupon' : 'Create New Discount Coupon'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Coupon Code</label>
              <input
                type="text"
                required
                placeholder="e.g. SASH50"
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none uppercase font-mono"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Discount Type</label>
                <select
                  className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none text-xs"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Flat (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Discount Value</label>
                <input
                  type="number"
                  required
                  min={0}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Min Order Value (₹)</label>
              <input
                type="number"
                min={0}
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Max Discount (₹)</label>
              <input
                type="number"
                min={0}
                placeholder="For Percentage"
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Usage Limit</label>
              <input
                type="number"
                min={0}
                placeholder="Optional"
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Expiry Date</label>
              <input
                type="date"
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Status</label>
              <select
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none text-xs"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-gray-150">
            <button
              type="submit"
              disabled={formLoading}
              className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded cursor-pointer disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : 'Save Coupon'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
              className="border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs px-4 py-2 rounded cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded text-gray-550 text-xs">
          No coupons created yet. Click "Create Coupon" to start.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50 text-[9px] font-bold uppercase tracking-wider text-gray-650">
              <tr>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Discount</th>
                <th className="px-6 py-3">Min Order</th>
                <th className="px-6 py-3">Max Discount</th>
                <th className="px-6 py-3">Expiry</th>
                <th className="px-6 py-3">Used Count</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-gray-650 font-medium">
              {coupons.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-1.5">
                    <Gift size={14} className="text-black" />
                    {c.code}
                  </td>
                  <td className="px-6 py-4">
                    {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Off`}
                  </td>
                  <td className="px-6 py-4">₹{c.minOrderValue || 0}</td>
                  <td className="px-6 py-4">₹{c.maxDiscount || '-'}</td>
                  <td className="px-6 py-4">{c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Never'}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : ''}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${
                      c.status === 'active' ? 'bg-green-50 text-green-700 border-green-150' : 'bg-gray-50 text-gray-700 border-gray-150'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(c)}
                      className="p-1 text-gray-500 hover:text-black cursor-pointer"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="p-1 text-gray-500 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
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
