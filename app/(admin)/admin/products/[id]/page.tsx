import React from 'react';
import ProductForm from '@/components/ProductForm';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Link from 'next/link';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  await connectDB();
  const product = await Product.findById(id).populate('category');

  if (!product) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm font-semibold text-red-600">Product not found.</p>
        <Link href="/admin/products" className="inline-block bg-black text-white text-xs font-bold px-6 py-2.5 rounded uppercase tracking-wider">
          Back to Directory
        </Link>
      </div>
    );
  }

  // Serialize Mongoose doc
  const serializedProduct = JSON.parse(JSON.stringify(product));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-3">
        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
          Edit Product details
        </h1>
        <p className="text-xs text-gray-500">Edit item properties, gallery images, or stock levels.</p>
      </div>

      <ProductForm initialData={serializedProduct} productId={id} />

    </div>
  );
}
