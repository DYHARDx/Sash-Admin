import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
// Register Category schema for populate
import '@/lib/models/Category';
import Link from 'next/link';
import { Plus, Edit, Search } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}

export default async function ProductsListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const statusFilter = params.status || '';

  await connectDB();

  // Build MongoDB query filters
  const filterQuery: any = {};
  if (query.trim()) {
    filterQuery.name = { $regex: query, $options: 'i' };
  }
  if (statusFilter) {
    filterQuery.status = statusFilter;
  }

  const products = await Product.find(filterQuery)
    .populate('category')
    .sort({ createdAt: -1 });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
            Products Directory
          </h1>
          <p className="text-xs text-gray-500">Manage catalog inventory, variants pricing, and status publishing.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1 bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded uppercase tracking-wider cursor-pointer"
        >
          <Plus size={14} /> Add Product
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <form method="GET" className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 p-4 border border-gray-200 rounded">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search products by title..."
            className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 pl-9 text-xs focus:border-black focus:outline-none"
          />
          <Search className="absolute left-3 top-2 text-gray-400" size={14} />
        </div>

        <div className="flex gap-2 w-full sm:w-auto self-stretch sm:self-center shrink-0">
          <select
            name="status"
            defaultValue={statusFilter}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-black focus:outline-none w-full sm:w-36"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <button
            type="submit"
            className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-1.5 rounded uppercase tracking-wider cursor-pointer text-center"
          >
            Filter
          </button>
        </div>
      </form>

      {/* Products table list */}
      {products.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded text-gray-550 text-xs">
          No products found matching filters.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50 text-[9px] font-bold uppercase tracking-wider text-gray-650">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Compare At</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-gray-600 font-medium">
              {products.map((prod) => (
                <tr key={prod._id.toString()} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100'}
                      alt=""
                      className="w-10 h-10 object-cover rounded border border-gray-200 bg-gray-50"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate max-w-[180px]">{prod.name}</p>
                      <p className="text-[9px] text-gray-400">ID: {prod._id.toString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{(prod.category as any)?.name || 'Uncategorized'}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">₹{prod.price}</td>
                  <td className="px-6 py-4 text-gray-500">₹{prod.compareAtPrice || '-'}</td>
                  <td className="px-6 py-4 font-semibold">{prod.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${
                      prod.status === 'published'
                        ? 'bg-green-50 text-green-700 border-green-150'
                        : prod.status === 'draft'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-150'
                        : 'bg-gray-50 text-gray-700 border-gray-150'
                    }`}>
                      {prod.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/products/${prod._id.toString()}`}
                      className="inline-flex items-center gap-0.5 bg-black hover:bg-gray-800 text-white font-bold py-1 px-2.5 rounded uppercase text-[9px] tracking-wide cursor-pointer"
                    >
                      <Edit size={10} /> Edit
                    </Link>
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
