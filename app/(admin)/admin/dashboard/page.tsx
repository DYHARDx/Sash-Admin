import { cookies } from 'next/headers';
import { verifyFirebaseToken } from '@/lib/auth-jwt';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import SupportTicket from '@/lib/models/SupportTicket';
import AdminDashboardCharts from '@/components/AdminDashboardCharts';
import Link from 'next/link';
import { ShoppingBag, DollarSign, Users, HelpCircle, ArrowRight, Eye } from 'lucide-react';

export default async function AdminDashboardOverview() {
  const cookieStore = await cookies();
  const adminSessionToken = cookieStore.get('admin_session_token')?.value;

  if (!adminSessionToken) {
    return (
      <div className="text-center text-xs text-gray-500 py-12">
        Please sign in as admin.
      </div>
    );
  }

  const decodedToken = await verifyFirebaseToken(adminSessionToken);
  if (!decodedToken) {
    return (
      <div className="text-center text-xs text-gray-500 py-12">
        Invalid session. Please login again.
      </div>
    );
  }

  await connectDB();

  // 1. Calculate Summary Metrics
  const totalOrders = await Order.countDocuments();
  const totalCustomers = await User.countDocuments();
  const activeTickets = await SupportTicket.countDocuments({ status: { $ne: 'Closed' } });

  // Sum sales where status is not Cancelled
  const salesResult = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  const totalSales = salesResult[0]?.total || 0;

  // 2. Fetch Recent Orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5);

  // 3. Compile charts data (Aggregated monthly over the last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyStats = await Order.aggregate([
    { 
      $match: { 
        createdAt: { $gte: sixMonthsAgo },
        status: { $ne: 'Cancelled' }
      } 
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        sales: { $sum: "$totalPrice" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Fill in the last 6 months even if there is no data
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const stat = monthlyStats.find(s => s._id.month === m && s._id.year === y);
    
    chartData.push({
      month: monthNames[m - 1],
      sales: stat ? stat.sales : 0,
      orders: stat ? stat.orders : 0
    });
  }

  return (
    <div className="space-y-8 flex-1 flex flex-col justify-between">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-3 flex justify-between items-baseline">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
            Overview Dashboard
          </h1>
          <p className="text-xs text-gray-500">Real-time statistics and metrics monitor.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex items-center gap-4">
          <span className="p-2.5 bg-black text-white rounded">
            <DollarSign size={20} />
          </span>
          <div>
            <p className="text-[9px] font-bold text-gray-450 uppercase tracking-wider">Gross Sales</p>
            <p className="text-lg font-black text-gray-900">₹{totalSales}</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex items-center gap-4">
          <span className="p-2.5 bg-black text-white rounded">
            <ShoppingBag size={20} />
          </span>
          <div>
            <p className="text-[9px] font-bold text-gray-455 uppercase tracking-wider">Total Orders</p>
            <p className="text-lg font-black text-gray-900">{totalOrders}</p>
          </div>
        </div>

        {/* Active Tickets */}
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex items-center gap-4">
          <span className="p-2.5 bg-black text-white rounded">
            <HelpCircle size={20} />
          </span>
          <div>
            <p className="text-[9px] font-bold text-gray-455 uppercase tracking-wider">Active Tickets</p>
            <p className="text-lg font-black text-gray-900">{activeTickets}</p>
          </div>
        </div>

        {/* Registered Customers */}
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex items-center gap-4">
          <span className="p-2.5 bg-black text-white rounded">
            <Users size={20} />
          </span>
          <div>
            <p className="text-[9px] font-bold text-gray-455 uppercase tracking-wider">Registered Users</p>
            <p className="text-lg font-black text-gray-900">{totalCustomers}</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <AdminDashboardCharts data={chartData} />

      {/* Recent Orders log */}
      <div className="space-y-4 pt-4">
        <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">Recent Purchases</h2>
          <Link href="/admin/orders" className="text-[10px] font-bold text-gray-500 hover:text-black uppercase tracking-wider flex items-center gap-0.5">
            View Desk <ArrowRight size={10} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded text-gray-500 text-xs">
            No orders registered in the system yet.
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-[9px] font-bold uppercase tracking-wider text-gray-650">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Total Price</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white text-gray-600 font-medium">
                {recentOrders.map((ord) => (
                  <tr key={ord._id.toString()} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-900">{ord.orderId}</td>
                    <td className="px-6 py-4">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">₹{ord.totalPrice}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${
                        ord.status === 'Delivered'
                          ? 'bg-green-50 text-green-700'
                          : ord.status === 'Cancelled'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-yellow-50 text-yellow-700'
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

    </div>
  );
}
