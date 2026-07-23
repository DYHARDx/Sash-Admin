'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      // Stub: Since Firebase is removed, password resets would require a custom API
      // For now, we simulate a request.
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('If an account exists, a password reset link has been sent to your email.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f6f7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-white p-8 border border-gray-300 rounded shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reset Password</h1>
          <p className="mt-1 text-sm text-gray-600">Enter your email address to retrieve your password</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-sm rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 text-sm rounded">
            {message}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} method="POST">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm"
              placeholder="admin@sash.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <Link
              href="/login"
              className="font-semibold text-gray-600 hover:text-black"
            >
              Back to Login
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Sending link...' : 'Send Password Reset Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
