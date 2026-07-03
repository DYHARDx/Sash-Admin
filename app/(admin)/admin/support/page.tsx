'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Loader2, Check, Search } from 'lucide-react';

interface Ticket {
  _id: string;
  ticketId: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Closed';
  department: string;
  createdAt: string;
}

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  // Filter local tickets based on search query and status filter
  const filteredTickets = tickets.filter((tck) => {
    const matchesSearch = tck.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tck.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === '' || tck.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-xs text-gray-700 font-medium">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-3">
        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
          Support Desk
        </h1>
        <p className="text-xs text-gray-500">Respond to customer issues, refund inquiries, and delivery questions.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs font-semibold rounded">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 p-4 border border-gray-200 rounded">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search tickets by ID or subject..."
            className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 pl-9 text-xs focus:border-black focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2 text-gray-400" size={14} />
        </div>

        <div className="flex gap-2 w-full sm:w-auto self-stretch sm:self-center shrink-0">
          <select
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-black focus:outline-none w-full sm:w-36 font-semibold"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading support tickets...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded text-gray-550 text-xs">
          No support tickets registered matching filters.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50 text-[9px] font-bold uppercase tracking-wider text-gray-650">
              <tr>
                <th className="px-6 py-3">Ticket ID</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date Created</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-gray-650 font-medium">
              {filteredTickets.map((tck) => (
                <tr key={tck._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">{tck.ticketId}</td>
                  <td className="px-6 py-4 max-w-[200px] truncate">{tck.subject}</td>
                  <td className="px-6 py-4">{tck.department || 'Support'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${
                      tck.status === 'Open'
                        ? 'bg-blue-50 text-blue-700 border-blue-150'
                        : tck.status === 'In Progress'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-150'
                        : 'bg-gray-50 text-gray-700 border-gray-150'
                    }`}>
                      {tck.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(tck.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/support/${tck.ticketId}`}
                      className="inline-flex items-center gap-1 bg-black hover:bg-gray-800 text-white font-bold py-1 px-3 rounded uppercase text-[9px] tracking-wide cursor-pointer"
                    >
                      <MessageSquare size={12} />
                      Reply
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
