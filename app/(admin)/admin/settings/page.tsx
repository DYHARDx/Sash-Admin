'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert, Loader2, Save, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const { mongoAdmin } = useAuth();
  const [storeName, setStoreName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiMerchantName, setUpiMerchantName] = useState('');
  const [upiHelpText, setUpiHelpText] = useState('');
  const [upiHelpImageUrl, setUpiHelpImageUrl] = useState('');
  const [upiHelpVideoUrl, setUpiHelpVideoUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const isSuperAdmin = mongoAdmin?.role?.name === 'Super Admin';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (res.ok && data.settings) {
        setStoreName(data.settings.storeName);
        setUpiId(data.settings.upiId);
        setUpiMerchantName(data.settings.upiMerchantName);
        setUpiHelpText(data.settings.upiHelpText || '');
        setUpiHelpImageUrl(data.settings.upiHelpImageUrl || '');
        setUpiHelpVideoUrl(data.settings.upiHelpVideoUrl || '');
      } else {
        throw new Error(data.error || 'Failed to load store settings.');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to retrieve settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFeedback('');

    if (!storeName.trim() || !upiId.trim() || !upiMerchantName.trim()) {
      setError('All fields are required.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: storeName.trim(),
          upiId: upiId.trim(),
          upiMerchantName: upiMerchantName.trim(),
          upiHelpText: upiHelpText.trim(),
          upiHelpImageUrl: upiHelpImageUrl.trim(),
          upiHelpVideoUrl: upiHelpVideoUrl.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback('Store settings updated successfully!');
      } else {
        throw new Error(data.error || 'Failed to update store settings.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  // Render Access Denied for other admin roles
  if (!loading && !isSuperAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4 text-xs font-semibold">
        <ShieldAlert className="text-red-500 mx-auto" size={48} />
        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">Access Denied</h1>
        <p className="text-xs text-gray-500">Only Super Administrators hold access permissions to modify core settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs text-gray-700 font-medium max-w-3xl">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-3">
        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
          Store Settings
        </h1>
        <p className="text-xs text-gray-500">Configure global metadata parameters, receiver UPI addresses, and payee merchant names.</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading settings...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs font-semibold rounded">
              {error}
            </div>
          )}

          {feedback && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 text-xs font-semibold rounded flex items-center gap-1.5">
              <Sparkles size={14} />
              {feedback}
            </div>
          )}

          {/* Form Fields Card */}
          <div className="border border-gray-200 rounded p-6 bg-white space-y-4">
            
            <h2 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-2">
              Metadata & Global Settings
            </h2>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Store Brand Name</label>
              <input
                type="text"
                placeholder="e.g. SASH"
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
              <p className="text-[10px] text-gray-400">Sets the brand name displayed across titles and headers.</p>
            </div>

            <h2 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-2 pt-4">
              UPI Gateway Integration Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">UPI VPA ID (Merchant ID)</label>
                <input
                  type="text"
                  placeholder="e.g. storename@okaxis"
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none font-mono"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
                <p className="text-[10px] text-gray-400">The receiver VPA/UPI address where checkout transfer funds are routed.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">UPI Merchant Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sash Clothing"
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none"
                  value={upiMerchantName}
                  onChange={(e) => setUpiMerchantName(e.target.value)}
                />
                <p className="text-[10px] text-gray-400">The registered merchant entity displayed inside banking apps upon scan.</p>
              </div>
            </div>

            <h2 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-2 pt-4">
              Checkout Help & Instructions
            </h2>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Transaction ID Help Text (Optional)</label>
                <textarea
                  placeholder="Explain how to find the Transaction ID..."
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none min-h-[80px]"
                  value={upiHelpText}
                  onChange={(e) => setUpiHelpText(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Help Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/screenshot.png"
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none"
                    value={upiHelpImageUrl}
                    onChange={(e) => setUpiHelpImageUrl(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-400">An image showing where to find the ID (proof/example).</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Help Video URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none"
                    value={upiHelpVideoUrl}
                    onChange={(e) => setUpiHelpVideoUrl(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-400">A video link guiding users on how to find their UPI ID.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Submit Actions */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1 bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded uppercase text-[10px] tracking-wide cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={12} /> Saving...
                </>
              ) : (
                <>
                  <Save size={12} /> Save Configurations
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
