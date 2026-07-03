'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Check, Loader2, Search } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | any;
  status: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate slug
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/[\s_-]+/g, '-') // Replace spaces with hyphens
      .replace(/^-+|-+$/g, ''); // Trim hyphens
    setSlug(generatedSlug);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFeedback('');
    setFormLoading(true);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          parentCategory: parentCategory || undefined
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback(`Category '${data.category.name}' created successfully.`);
      setName('');
      setSlug('');
      setDescription('');
      setParentCategory('');
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to create category.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-3">
        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
          Categories Management
        </h1>
        <p className="text-xs text-gray-500">Configure catalog departments and subcategories hierarchies.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left side: Categories list table */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
            Active Categories
          </h2>

          {loading ? (
            <div className="text-center py-8 text-xs text-gray-500">Loading categories list...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded text-gray-500 text-xs">
              No categories registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                <thead className="bg-gray-50 text-[9px] font-bold uppercase tracking-wider text-gray-655">
                  <tr>
                    <th className="px-6 py-3">Category Name</th>
                    <th className="px-6 py-3">Slug</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Parent Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-gray-600 font-medium">
                  {categories.map((cat) => {
                    const parentName = typeof cat.parent === 'object' && cat.parent
                      ? cat.parent.name
                      : categories.find((c) => c._id === cat.parent)?.name || '-';

                    return (
                      <tr key={cat._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-900">{cat.name}</td>
                        <td className="px-6 py-4 font-mono text-[10px] text-gray-500">{cat.slug}</td>
                        <td className="px-6 py-4 max-w-[200px] truncate">{cat.description || '-'}</td>
                        <td className="px-6 py-4">{parentName}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right side: Category add form */}
        <div className="p-4 border border-gray-200 rounded bg-gray-50 space-y-4 self-start">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-150 pb-2">
            Create Category
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Category Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Menswear"
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Slug</label>
              <input
                type="text"
                required
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none font-mono"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Parent Category</label>
              <select
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                value={parentCategory}
                onChange={(e) => setParentCategory(e.target.value)}
              >
                <option value="">None (Top Level)</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Brief category details..."
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:border-black focus:outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold text-xs py-2 rounded uppercase tracking-wider disabled:opacity-50 cursor-pointer flex justify-center items-center"
            >
              {formLoading ? <Loader2 className="animate-spin" size={14} /> : 'Save Category'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
