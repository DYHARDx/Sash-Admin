'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2, User } from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  orderCount?: number;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (res.ok) {
        setCustomers(data.customers);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  // Filter local customers list based on search query
  const filteredCustomers = customers.filter((c) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = c.name.toLowerCase().includes(query);
    const emailMatch = c.email.toLowerCase().includes(query);
    const phoneMatch = c.phone ? c.phone.includes(query) : false;
    return nameMatch || emailMatch || phoneMatch;
  });

  return (
    <div className="space-y-6 text-xs text-gray-700 font-medium">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-3">
        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
          Customers Directory
        </h1>
        <p className="text-xs text-gray-500">View registered user accounts and verify contact details.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs font-semibold rounded">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="relative w-full max-w-md">
        <input
          type="text"
          placeholder="Search by name, email, or phone number..."
          className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 pl-9 text-xs focus:border-black focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-2 text-gray-400" size={14} />
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading customers...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded text-gray-550 text-xs">
          No registered customers found matching query.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50 text-[9px] font-bold uppercase tracking-wider text-gray-655">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email Address</th>
                <th className="px-6 py-3">Phone Number</th>
                <th className="px-6 py-3">Total Orders</th>
                <th className="px-6 py-3">Date Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-gray-650 font-medium">
              {filteredCustomers.map((cust) => {
                const isTempEmail = cust.email.endsWith('@temporary-sash.com');
                return (
                  <tr key={cust._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 flex items-center gap-2">
                      <span className="p-1.5 bg-gray-105 text-gray-600 rounded-full shrink-0">
                        <User size={12} />
                      </span>
                      <span className="font-bold text-gray-900">{cust.name}</span>
                    </td>
                    <td className="px-6 py-4 truncate max-w-[200px]">
                      {isTempEmail ? (
                        <span className="text-[10px] text-gray-400 italic">No Email (OTP Verified Only)</span>
                      ) : (
                        cust.email
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono">{cust.phone || '-'}</td>
                    <td className="px-6 py-4">
                      {cust.orderCount !== undefined ? (
                        <span className="inline-flex items-center justify-center bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-1 rounded-full">
                          {cust.orderCount}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">{new Date(cust.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
