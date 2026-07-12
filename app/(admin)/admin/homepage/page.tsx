'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Save, Image as ImageIcon } from 'lucide-react';

export default function HomepageSettings() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/homepage')
      .then(r => r.json())
      .then(d => {
        if (d.success) setConfig(d.settings);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Homepage settings saved successfully!');
        setConfig(data.settings);
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!config) return <div className="p-8 text-center text-red-500">Failed to load configuration.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wider">Homepage Layout Config</h1>
          <p className="text-xs text-gray-500 mt-1">Manage images, texts, and links for the storefront homepage.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* CATEGORIES SECTION */}
        <section className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-2">1. Featured Categories (3 Blocks)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {config.categories.map((cat: any, idx: number) => (
              <div key={idx} className="space-y-3 bg-gray-50 p-4 rounded border border-gray-100">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Label</label>
                  <input
                    type="text"
                    value={cat.label}
                    onChange={(e) => {
                      const newCat = [...config.categories];
                      newCat[idx].label = e.target.value;
                      setConfig({ ...config, categories: newCat });
                    }}
                    className="w-full mt-1 px-3 py-2 text-xs border border-gray-300 rounded focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Image URL</label>
                  <input
                    type="text"
                    value={cat.image}
                    onChange={(e) => {
                      const newCat = [...config.categories];
                      newCat[idx].image = e.target.value;
                      setConfig({ ...config, categories: newCat });
                    }}
                    className="w-full mt-1 px-3 py-2 text-xs border border-gray-300 rounded focus:border-black focus:outline-none"
                  />
                </div>
                {cat.image && (
                  <div className="aspect-[4/5] bg-gray-200 rounded overflow-hidden relative">
                    <img src={cat.image} alt={cat.label} className="object-cover w-full h-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* NEW SEASON SECTION */}
        <section className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-2">2. New Season Showcase</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Title</label>
                <input
                  type="text"
                  value={config.newSeason.title}
                  onChange={(e) => setConfig({ ...config, newSeason: { ...config.newSeason, title: e.target.value } })}
                  className="w-full mt-1 px-3 py-2 text-xs border border-gray-300 rounded focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Description</label>
                <textarea
                  value={config.newSeason.description}
                  onChange={(e) => setConfig({ ...config, newSeason: { ...config.newSeason, description: e.target.value } })}
                  className="w-full mt-1 px-3 py-2 text-xs border border-gray-300 rounded focus:border-black focus:outline-none min-h-[80px]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Back Image URL</label>
                <input
                  type="text"
                  value={config.newSeason.backImage}
                  onChange={(e) => setConfig({ ...config, newSeason: { ...config.newSeason, backImage: e.target.value } })}
                  className="w-full mt-1 px-3 py-2 text-xs border border-gray-300 rounded focus:border-black focus:outline-none"
                />
                <img src={config.newSeason.backImage} className="h-32 object-cover rounded border" alt="Back" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Front Image URL</label>
                <input
                  type="text"
                  value={config.newSeason.frontImage}
                  onChange={(e) => setConfig({ ...config, newSeason: { ...config.newSeason, frontImage: e.target.value } })}
                  className="w-full mt-1 px-3 py-2 text-xs border border-gray-300 rounded focus:border-black focus:outline-none"
                />
                <img src={config.newSeason.frontImage} className="h-32 object-cover rounded border" alt="Front" />
              </div>
            </div>
          </div>
        </section>

        {/* PROMO SECTION */}
        <section className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-2">3. Promo Banner (Limited Offer)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Title</label>
                <input
                  type="text"
                  value={config.promo.title}
                  onChange={(e) => setConfig({ ...config, promo: { ...config.promo, title: e.target.value } })}
                  className="w-full mt-1 px-3 py-2 text-xs border border-gray-300 rounded focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Promo Code</label>
                <input
                  type="text"
                  value={config.promo.code}
                  onChange={(e) => setConfig({ ...config, promo: { ...config.promo, code: e.target.value } })}
                  className="w-full mt-1 px-3 py-2 text-xs border border-gray-300 rounded focus:border-black focus:outline-none uppercase"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Left Model Image URL</label>
                <input
                  type="text"
                  value={config.promo.leftImage}
                  onChange={(e) => setConfig({ ...config, promo: { ...config.promo, leftImage: e.target.value } })}
                  className="w-full mt-1 px-3 py-2 text-xs border border-gray-300 rounded focus:border-black focus:outline-none"
                />
                <div className="bg-gray-800 p-2 rounded">
                  <img src={config.promo.leftImage} className="h-24 object-contain mx-auto" alt="Left" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Right Model Image URL</label>
                <input
                  type="text"
                  value={config.promo.rightImage}
                  onChange={(e) => setConfig({ ...config, promo: { ...config.promo, rightImage: e.target.value } })}
                  className="w-full mt-1 px-3 py-2 text-xs border border-gray-300 rounded focus:border-black focus:outline-none"
                />
                <div className="bg-gray-800 p-2 rounded">
                  <img src={config.promo.rightImage} className="h-24 object-contain mx-auto" alt="Right" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-2">4. About Us Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Title</label>
                <input
                  type="text"
                  value={config.about.title}
                  onChange={(e) => setConfig({ ...config, about: { ...config.about, title: e.target.value } })}
                  className="w-full mt-1 px-3 py-2 text-xs border border-gray-300 rounded focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Description</label>
                <textarea
                  value={config.about.description}
                  onChange={(e) => setConfig({ ...config, about: { ...config.about, description: e.target.value } })}
                  className="w-full mt-1 px-3 py-2 text-xs border border-gray-300 rounded focus:border-black focus:outline-none min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Instagram URL</label>
                <input
                  type="text"
                  value={config.about.instagramUrl}
                  onChange={(e) => setConfig({ ...config, about: { ...config.about, instagramUrl: e.target.value } })}
                  className="w-full mt-1 px-3 py-2 text-xs border border-gray-300 rounded focus:border-black focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Side Image URL</label>
              <input
                type="text"
                value={config.about.image}
                onChange={(e) => setConfig({ ...config, about: { ...config.about, image: e.target.value } })}
                className="w-full mt-1 px-3 py-2 text-xs border border-gray-300 rounded focus:border-black focus:outline-none"
              />
              <img src={config.about.image} className="h-48 w-full object-cover rounded border" alt="About" />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
