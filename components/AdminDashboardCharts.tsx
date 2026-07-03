'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

interface ChartData {
  month: string;
  sales: number;
  orders: number;
}

interface AdminDashboardChartsProps {
  data: ChartData[];
}

export default function AdminDashboardCharts({ data }: AdminDashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white py-4">
      
      {/* Sales Trend Chart */}
      <div className="border border-gray-200 rounded p-4 bg-gray-50 flex flex-col space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">Monthly Revenue</h3>
          <p className="text-[10px] text-gray-500">Gross transaction volume for the past 6 months.</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '4px', fontSize: '12px' }}
                formatter={(value) => [`₹${value}`, 'Sales']}
              />
              <Area type="monotone" dataKey="sales" stroke="#000000" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Volume Chart */}
      <div className="border border-gray-200 rounded p-4 bg-gray-50 flex flex-col space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">Order Volumes</h3>
          <p className="text-[10px] text-gray-500">Total number of checkout orders received monthly.</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '4px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="orders" stroke="#2563EB" strokeWidth={2} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
