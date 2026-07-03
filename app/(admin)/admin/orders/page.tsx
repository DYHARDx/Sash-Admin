import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function OrdersListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const statusFilter = params.status || '';

  await connectDB();

  // Build MongoDB query filters
  const filterQuery: any = {};
  if (query.trim()) {
    filterQuery.orderId = { $regex: query, $options: 'i' };
  }
  if (statusFilter) {
    filterQuery.status = statusFilter;
  }

  const orders = await Order.find(filterQuery)
    .sort({ createdAt: -1 });

  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-3">
        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
          Orders Desk
        </h1>
        <p className="text-xs text-gray-500">Monitor customer transactions, UPI screenshot receipts, and fulfillment status.</p>
      </div>

      {/* Filter and Search Bar */}
      <form method="GET" className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 p-4 border border-gray-200 rounded">
        <div className="relative flex-1 w-full font-medium">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by Order ID (e.g. ORD-XXXXXX)..."
            className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 pl-9 text-xs focus:border-black focus:outline-none"
          />
          <Search className="absolute left-3 top-2 text-gray-400" size={14} />
        </div>

        <div className="flex gap-2 w-full sm:w-auto self-stretch sm:self-center shrink-0">
          <select
            name="status"
            defaultValue={statusFilter}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-black focus:outline-none w-full sm:w-36 font-semibold"
          >
            <option value="">All Statuses</option>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-4 py-1.5 rounded uppercase tracking-wider cursor-pointer text-center text-xs"
          >
            Filter
          </button>
        </div>
      </form>

      {/* Orders listing table */}
      {orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded text-gray-550 text-xs">
          No orders registered matching filters.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50 text-[9px] font-bold uppercase tracking-wider text-gray-650">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Customer Name</th>
                <th className="px-6 py-3">Payment Method</th>
                <th className="px-6 py-3">Total Value</th>
                <th className="px-6 py-3">Payment Status</th>
                <th className="px-6 py-3">Order Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-gray-650 font-medium">
              {orders.map((ord) => (
                <tr key={ord._id.toString()} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">{ord.orderId}</td>
                  <td className="px-6 py-4">{new Date(ord.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 truncate max-w-[150px]">{ord.shippingAddress.fullName}</td>
                  <td className="px-6 py-4 font-bold">{ord.paymentMethod}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">₹{ord.totalPrice}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${
                      ord.paymentStatus === 'Approved'
                        ? 'bg-green-50 text-green-700 border-green-150'
                        : ord.paymentStatus === 'Rejected'
                        ? 'bg-red-50 text-red-700 border-red-150'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-150'
                    }`}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${
                      ord.status === 'Delivered'
                        ? 'bg-green-50 text-green-700 border-green-150'
                        : ord.status === 'Cancelled'
                        ? 'bg-red-50 text-red-700 border-red-150'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-150'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/orders/${ord.orderId}`}
                      className="inline-flex items-center gap-0.5 bg-black hover:bg-gray-800 text-white font-bold py-1 px-2.5 rounded uppercase text-[9px] tracking-wide cursor-pointer"
                    >
                      <Eye size={10} /> View
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
