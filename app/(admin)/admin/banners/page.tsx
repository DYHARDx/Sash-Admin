'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Upload, Check, Loader2, Link as LinkIcon } from 'lucide-react';

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl: string;
  status: 'active' | 'inactive';
  position: number;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [position, setPosition] = useState(0);

  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/banners');
      const data = await res.json();
      if (res.ok) {
        setBanners(data.banners);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load banners.');
    } finally {
      setLoading(false);
    }
  };



  const handleEditClick = (b: Banner) => {
    setEditId(b._id);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setImageUrl(b.imageUrl);
    setLinkUrl(b.linkUrl);
    setStatus(b.status);
    setPosition(b.position);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    setError('');
    setFeedback('');
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback('Banner deleted successfully.');
      fetchBanners();
    } catch (e: any) {
      setError(e.message || 'Failed to delete banner.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFeedback('');
    setFormLoading(true);

    if (!imageUrl) {
      setError('Please upload a banner image first.');
      setFormLoading(false);
      return;
    }

    const payload = {
      title,
      subtitle,
      imageUrl,
      linkUrl,
      status,
      position: Number(position)
    };

    try {
      const url = editId ? `/api/banners/${editId}` : '/api/banners';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback(editId ? 'Banner updated successfully.' : 'New banner published successfully.');
      setShowForm(false);
      setEditId(null);
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      setLinkUrl('');
      setStatus('active');
      setPosition(0);
      fetchBanners();
    } catch (err: any) {
      setError(err.message || 'Failed to save banner.');
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
            Promotional Banners
          </h1>
          <p className="text-xs text-gray-500">Configure visual slide banners and CTA links for the customer storefront.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditId(null);
              setTitle('');
              setSubtitle('');
              setImageUrl('');
              setLinkUrl('');
              setStatus('active');
              setPosition(0);
              setShowForm(true);
            }}
            className="flex items-center gap-1 bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded uppercase tracking-wider cursor-pointer"
          >
            <Plus size={14} /> Create Banner
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

      {/* Form Drawer Section */}
      {showForm ? (
        <form onSubmit={handleFormSubmit} className="bg-gray-50 p-6 border border-gray-200 rounded space-y-4 max-w-xl">
          <h3 className="font-bold text-gray-900 uppercase text-[10px] tracking-wide border-b border-gray-150 pb-2">
            {editId ? 'Edit Banner' : 'Create New Promotional Banner'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Banner Title</label>
              <input
                type="text"
                required
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Subtitle (Optional)</label>
              <input
                type="text"
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">CTA Redirect URL</label>
              <input
                type="text"
                required
                placeholder="e.g. /sale or /category/sneakers"
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Position Index</label>
                <input
                  type="number"
                  required
                  min={0}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                  value={position}
                  onChange={(e) => setPosition(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Publish Status</label>
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
          </div>

          {/* Banner Graphic Uploader */}
          {/* Banner Graphic URL Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1">Banner Graphic URL</label>
            <div className="flex gap-4 items-center mt-1">
              <input
                type="text"
                placeholder="Paste image URL here..."
                className="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />

              {imageUrl && (
                <div className="relative border border-gray-200 rounded overflow-hidden w-40 h-20 bg-gray-50 flex-shrink-0">
                  <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-gray-150">
            <button
              type="submit"
              disabled={formLoading}
              className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded cursor-pointer disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : 'Save Banner'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
              className="border border-gray-300 hover:bg-gray-100 text-gray-750 text-xs px-4 py-2 rounded cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded text-gray-550 text-xs">
          No banners configured yet. Click "Create Banner" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div
              key={b._id}
              className={`border rounded overflow-hidden bg-white ${
                b.status === 'active' ? 'border-black/35' : 'border-gray-200'
              }`}
            >
              {/* Banner Graphic preview */}
              <div className="relative h-32 bg-gray-100">
                <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                <span className={`absolute top-2 left-2 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  b.status === 'active' ? 'bg-black text-white' : 'bg-gray-200 text-gray-650'
                }`}>
                  {b.status}
                </span>
                <span className="absolute top-2 right-2 text-[8px] font-bold bg-white/95 px-2 py-0.5 rounded border border-gray-200">
                  Pos: {b.position}
                </span>
              </div>

              {/* Banner labels & actions */}
              <div className="p-3 space-y-2">
                <div>
                  <h4 className="font-bold text-gray-900 truncate uppercase">{b.title}</h4>
                  {b.subtitle && <p className="text-[10px] text-gray-500 truncate">{b.subtitle}</p>}
                </div>

                <p className="text-[10px] text-gray-550 flex items-center gap-1 font-semibold">
                  <LinkIcon size={12} /> {b.linkUrl}
                </p>

                <div className="flex gap-2 pt-2 border-t border-gray-100 justify-end">
                  <button
                    onClick={() => handleEditClick(b)}
                    className="p-1 text-gray-500 hover:text-black cursor-pointer"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="p-1 text-gray-500 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
