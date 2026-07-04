'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Upload, Check } from 'lucide-react';

interface Variant {
  size: string;
  color: string;
  sku: string;
  price?: number;
  stock: number;
}

interface Category {
  _id: string;
  name: string;
}

interface ProductFormProps {
  initialData?: any;
  productId?: string;
}

export default function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Primary fields
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price || 0);
  const [compareAtPrice, setCompareAtPrice] = useState(initialData?.compareAtPrice || 0);
  const [stock, setStock] = useState(initialData?.stock || 0);
  const [category, setCategory] = useState(initialData?.category?._id || initialData?.category || '');
  const [status, setStatus] = useState<string>(initialData?.status || 'draft');
  
  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<string[]>(initialData?.paymentMethods || ['UPI', 'COD']);

  // Images
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [imgUrlInput, setImgUrlInput] = useState('');

  // Variants list
  const [variants, setVariants] = useState<Variant[]>(initialData?.variants || []);
  const [varSize, setVarSize] = useState('');
  const [varColor, setVarColor] = useState('');
  const [varSku, setVarSku] = useState('');
  const [varPrice, setVarPrice] = useState<number | ''>('');
  const [varStock, setVarStock] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const handleAddImageUrl = () => {
    if (!imgUrlInput.trim()) return;
    setImages((prev) => [...prev, imgUrlInput.trim()]);
    setImgUrlInput('');
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    if (!varSize.trim() || !varColor.trim() || !varSku.trim()) {
      alert('Size, Color, and SKU are required to add a variant.');
      return;
    }
    const newVariant: Variant = {
      size: varSize.trim(),
      color: varColor.trim(),
      sku: varSku.trim(),
      stock: varStock,
      price: varPrice === '' ? undefined : Number(varPrice)
    };
    setVariants((prev) => [...prev, newVariant]);

    // Reset variant inputs
    setVarSize('');
    setVarColor('');
    setVarSku('');
    setVarPrice('');
    setVarStock(0);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaymentMethodToggle = (method: string) => {
    if (paymentMethods.includes(method)) {
      setPaymentMethods((prev) => prev.filter((m) => m !== method));
    } else {
      setPaymentMethods((prev) => [...prev, method]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFeedback('');
    setLoading(true);

    if (images.length === 0) {
      setError('Please upload at least one image.');
      setLoading(false);
      return;
    }

    if (paymentMethods.length === 0) {
      setError('Please select at least one allowed payment method.');
      setLoading(false);
      return;
    }

    const payload = {
      name,
      description,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      stock: Number(stock),
      category,
      images,
      variants,
      paymentMethods,
      status,
    };

    try {
      const url = productId ? `/api/products/${productId}` : '/api/products';
      const method = productId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback(productId ? 'Product updated successfully.' : 'Product created successfully.');
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save product details.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl text-xs font-medium text-gray-700">
      
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
        
        {/* Left column (Primary info) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General details */}
          <div className="p-4 border border-gray-200 rounded space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">General Details</h3>
            
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Product Title</label>
              <input
                type="text"
                required
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Description</label>
              <textarea
                rows={5}
                required
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:border-black focus:outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="p-4 border border-gray-200 rounded space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">Pricing & Inventory</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Compare At Price (₹)</label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Total Stock</label>
                <input
                  type="number"
                  required
                  min={0}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Variants Manager */}
          <div className="p-4 border border-gray-200 rounded space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">Colors & Sizes Variants</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
              <div>
                <label className="block text-[9px] font-bold uppercase mb-0.5">Size</label>
                <input
                  type="text"
                  placeholder="e.g. S, M"
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-black focus:outline-none"
                  value={varSize}
                  onChange={(e) => setVarSize(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase mb-0.5">Color</label>
                <input
                  type="text"
                  placeholder="e.g. Black"
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-black focus:outline-none"
                  value={varColor}
                  onChange={(e) => setVarColor(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase mb-0.5">SKU</label>
                <input
                  type="text"
                  placeholder="sku-code"
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-black focus:outline-none"
                  value={varSku}
                  onChange={(e) => setVarSku(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase mb-0.5">Price (₹)</label>
                <input
                  type="number"
                  placeholder="Optional"
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-black focus:outline-none"
                  value={varPrice}
                  onChange={(e) => setVarPrice(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase mb-0.5">Stock</label>
                <input
                  type="number"
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-black focus:outline-none"
                  value={varStock}
                  onChange={(e) => setVarStock(Number(e.target.value))}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1 border border-black hover:bg-gray-100 text-black font-bold text-[10px] px-3 py-1.5 rounded uppercase tracking-wider cursor-pointer"
            >
              <Plus size={12} /> Add Variant
            </button>

            {variants.length > 0 && (
              <div className="overflow-x-auto border border-gray-250 rounded">
                <table className="min-w-full divide-y divide-gray-200 text-left text-[11px]">
                  <thead className="bg-gray-50 text-[9px] font-bold uppercase text-gray-650">
                    <tr>
                      <th className="px-4 py-2">Size</th>
                      <th className="px-4 py-2">Color</th>
                      <th className="px-4 py-2">SKU</th>
                      <th className="px-4 py-2">Price</th>
                      <th className="px-4 py-2">Stock</th>
                      <th className="px-4 py-2 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white text-gray-700">
                    {variants.map((v, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-bold">{v.size}</td>
                        <td className="px-4 py-2">{v.color}</td>
                        <td className="px-4 py-2 font-mono text-gray-550">{v.sku}</td>
                        <td className="px-4 py-2 font-semibold">₹{v.price || price}</td>
                        <td className="px-4 py-2 font-semibold">{v.stock}</td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeVariant(i)}
                            className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right column (Metadata, photos & publishing) */}
        <div className="space-y-6">
          
          {/* Status & Catalog Info */}
          <div className="p-4 border border-gray-200 rounded space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">Organization</h3>
            
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Status</label>
              <select
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Category</label>
              <select
                required
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Allowed Payment Methods */}
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1">Allowed Payments</label>
              <div className="space-y-2 mt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    className="h-4 w-4 border-gray-300 text-black focus:ring-black cursor-pointer"
                    checked={paymentMethods.includes('UPI')}
                    onChange={() => handlePaymentMethodToggle('UPI')}
                  />
                  <span>UPI Payment (Scan QR)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    className="h-4 w-4 border-gray-300 text-black focus:ring-black cursor-pointer"
                    checked={paymentMethods.includes('COD')}
                    onChange={() => handlePaymentMethodToggle('COD')}
                  />
                  <span>Cash on Delivery (COD)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Image URL Manager */}
          <div className="p-4 border border-gray-200 rounded space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">Image Gallery URLs</h3>
            
            {/* URL Input */}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Paste image URL here..."
                className="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 focus:border-black focus:outline-none"
                value={imgUrlInput}
                onChange={(e) => setImgUrlInput(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="bg-black text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded hover:bg-gray-800"
              >
                Add Link
              </button>
            </div>

            {/* List previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {images.map((imgUrl, i) => (
                  <div key={i} className="relative group border border-gray-200 rounded overflow-hidden h-20 bg-gray-50">
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-0.5 bg-black text-white hover:bg-red-600 rounded cursor-pointer"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Form Submission Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-6 py-2.5 rounded uppercase tracking-wider disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-1">
              <Loader2 className="animate-spin" size={12} /> Saving...
            </span>
          ) : (
            'Publish Product'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs px-6 py-2.5 rounded uppercase tracking-wider cursor-pointer"
        >
          Cancel
        </button>
      </div>

    </form>
  );
}
