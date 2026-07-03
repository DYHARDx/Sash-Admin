import React from 'react';
import ProductForm from '@/components/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-3">
        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
          Create New Product
        </h1>
        <p className="text-xs text-gray-500">Publish a new catalog item with sizing variants.</p>
      </div>

      <ProductForm />

    </div>
  );
}
