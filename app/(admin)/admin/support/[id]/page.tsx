'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

interface Message {
  sender: 'User' | 'Admin';
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export default function AdminTicketChatPage({ params }: ChatPageProps) {
  const { id: ticketId } = use(params);

  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [inputText, setInputText] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchTicketAndMessages();

    // Poll for customer replies every 5 seconds
    const interval = setInterval(fetchMessagesOnly, 5000);
    return () => clearInterval(interval);
  }, [ticketId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchTicketAndMessages = async () => {
    try {
      const res = await fetch(`/api/tickets`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const activeTicket = data.tickets.find((t: any) => t.ticketId === ticketId);
      if (!activeTicket) {
        throw new Error('Ticket not found.');
      }
      setTicket(activeTicket);
      setMessages(activeTicket.messages);
    } catch (e: any) {
      setError(e.message || 'Failed to load ticket.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesOnly = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (e) {
      console.error('Failed to poll messages:', e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSendLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, data.message]);
      setInputText('');
      // Also update ticket local status since API automatically moves it to 'In Progress'
      if (ticket) {
        setTicket((prev: any) => ({ ...prev, status: 'In Progress' }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setSendLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!ticket) return;
    setStatusLoading(true);
    setError('');

    const newStatus = ticket.status === 'Closed' ? 'Open' : 'Closed';

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTicket((prev: any) => ({ ...prev, status: data.ticket.status }));
    } catch (err: any) {
      setError(err.message || 'Failed to change ticket status.');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm font-semibold text-red-600">{error || 'Ticket not found.'}</p>
        <Link href="/admin/support" className="inline-block bg-black text-white text-xs font-bold px-6 py-2.5 rounded uppercase tracking-wider">
          Back to Desk
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[520px] text-xs text-gray-700 font-medium">
      
      {/* Top Header Controls */}
      <div className="border-b border-gray-150 pb-3 flex justify-between items-start shrink-0">
        <div className="space-y-1">
          <Link href="/admin/support" className="text-[10px] font-bold text-gray-500 hover:text-black uppercase tracking-wider flex items-center gap-1 mb-1">
            <ArrowLeft size={10} /> Back
          </Link>
          <h2 className="text-sm font-bold text-gray-900 truncate max-w-[250px] uppercase">
            {ticket.subject}
          </h2>
          <p className="text-[9px] text-gray-450">ID: {ticket.ticketId} | Department: {ticket.department}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
            ticket.status === 'Closed' ? 'bg-gray-50 text-gray-600 border-gray-150' : 'bg-blue-50 text-blue-700 border-blue-150'
          }`}>
            {ticket.status}
          </span>
          <button
            onClick={handleToggleStatus}
            disabled={statusLoading}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded uppercase font-bold text-[9px] tracking-wider cursor-pointer border ${
              ticket.status === 'Closed'
                ? 'bg-black text-white border-black'
                : 'border-red-200 text-red-600 hover:bg-red-50'
            }`}
          >
            {statusLoading ? (
              <Loader2 className="animate-spin" size={10} />
            ) : ticket.status === 'Closed' ? (
              <>
                <RefreshCw size={10} /> Re-Open
              </>
            ) : (
              <>
                <CheckCircle size={10} /> Close Ticket
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ticket description display */}
      <div className="p-3 border border-gray-150 bg-gray-50 rounded mt-3 text-xs leading-relaxed shrink-0">
        <p className="font-bold text-gray-900 uppercase text-[9px] tracking-wider mb-1">Issue Description</p>
        <p className="text-gray-600 font-medium whitespace-pre-wrap">{ticket.description}</p>
      </div>

      {/* Chat logs area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="text-center text-xs text-gray-450 py-8">
            No messages yet. Send a message to start responding.
          </div>
        ) : (
          messages.map((msg, index) => {
            const isAdmin = msg.sender === 'Admin';
            return (
              <div key={index} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-3 rounded ${
                  isAdmin
                    ? 'bg-black text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                }`}>
                  <p className="text-[9px] font-bold opacity-60 mb-0.5">{msg.senderName}</p>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <span className="block text-[8px] opacity-40 text-right mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message Composer */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-150 pt-3 flex gap-2 shrink-0">
        <input
          type="text"
          placeholder={ticket.status === 'Closed' ? 'Opening a closed ticket...' : 'Type message here...'}
          required
          className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          type="submit"
          disabled={sendLoading || !inputText.trim()}
          className="bg-black hover:bg-gray-800 text-white p-2 rounded cursor-pointer disabled:opacity-50"
        >
          {sendLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
        </button>
      </form>

    </div>
  );
}
