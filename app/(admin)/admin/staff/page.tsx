'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert, Loader2, UserPlus, Shield, UserX, UserCheck, Trash2 } from 'lucide-react';

interface Role {
  _id: string;
  name: string;
}

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'suspended';
  createdAt: string;
}

export default function StaffPage() {
  const { mongoAdmin } = useAuth();
  
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const isSuperAdmin = mongoAdmin?.role?.name === 'Super Admin';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchStaffAndRoles();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  const fetchStaffAndRoles = async () => {
    setLoading(true);
    try {
      const [staffRes, rolesRes] = await Promise.all([
        fetch('/api/staff'),
        fetch('/api/roles'),
      ]);

      const staffData = await staffRes.json();
      const rolesData = await rolesRes.json();

      if (staffRes.ok && rolesRes.ok) {
        setStaff(staffData.staff);
        setRoles(rolesData.roles);
        if (rolesData.roles.length > 0) {
          setRoleId(rolesData.roles[0]._id);
        }
      } else {
        throw new Error(staffData.error || rolesData.error || 'Failed to fetch staff data.');
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setFeedback('');

    if (!name.trim() || !email.trim() || !password || !roleId) {
      setError('All fields are required.');
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          role: roleId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback(`Admin profile for '${data.admin.name}' created successfully.`);
        setName('');
        setEmail('');
        setPassword('');
        setShowForm(false);
        // Refresh local staff list
        setStaff([data.admin, ...staff]);
      } else {
        throw new Error(data.error || 'Failed to register admin profile.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create staff record.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (member: StaffMember) => {
    setError('');
    setFeedback('');
    
    // Prevent self-suspension
    if (member.email === mongoAdmin?.email) {
      setError('You cannot suspend your own administrative account.');
      return;
    }

    const newStatus = member.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/staff/${member._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback(`Status for '${data.staff.name}' updated to ${newStatus}.`);
        setStaff(staff.map((s) => (s._id === member._id ? data.staff : s)));
      } else {
        throw new Error(data.error || 'Failed to toggle account status.');
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    }
  };

  const handleDeleteStaff = async (id: string, email: string) => {
    // Prevent self-deletion
    if (email === mongoAdmin?.email) {
      setError('You cannot delete your own administrative account.');
      return;
    }

    if (!confirm('Are you sure you want to permanently delete this administrator account?')) {
      return;
    }

    setError('');
    setFeedback('');
    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setFeedback('Staff profile deleted successfully.');
        setStaff(staff.filter((s) => s._id !== id));
      } else {
        throw new Error(data.error || 'Failed to delete staff member.');
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    }
  };

  // Access Denied guard
  if (!loading && !isSuperAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4 text-xs font-semibold">
        <ShieldAlert className="text-red-500 mx-auto" size={48} />
        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">Access Denied</h1>
        <p className="text-xs text-gray-500">Only Super Administrators hold access permissions to view the staff directory.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs text-gray-700 font-medium">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
            Staff Directory
          </h1>
          <p className="text-xs text-gray-500">Create, suspend, delete, or manage roles of administrative accounts.</p>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1 bg-black hover:bg-gray-800 text-white font-bold py-1.5 px-3 rounded uppercase text-[10px] tracking-wide cursor-pointer"
        >
          <UserPlus size={12} /> {showForm ? 'Close Panel' : 'Add Staff'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs font-semibold rounded">
          {error}
        </div>
      )}

      {feedback && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 text-xs font-semibold rounded">
          {feedback}
        </div>
      )}

      {/* Inline Create Staff Panel */}
      {showForm && (
        <form onSubmit={handleCreateStaff} className="border border-gray-200 rounded p-6 bg-white space-y-4 max-w-xl">
          <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1">
            <Shield size={14} className="text-black" />
            Register Administrative Account
          </h3>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              placeholder="e.g. rahul@sash.in"
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none font-mono"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Temporary Password</label>
            <input
              type="text"
              placeholder="e.g. Secret@123"
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none font-mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-[10px] text-gray-400">Share this password with the new staff member.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Administrative Role</label>
            <select
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none font-semibold"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={formLoading}
              className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded uppercase text-[10px] tracking-wide cursor-pointer disabled:opacity-50"
            >
              {formLoading ? 'Registering...' : 'Register Profile'}
            </button>
          </div>
        </form>
      )}

      {/* Staff directory table */}
      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading staff records...</div>
      ) : staff.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded text-gray-500 text-xs">
          No registered staff records found.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50 text-[9px] font-bold uppercase tracking-wider text-gray-655">
              <tr>
                <th className="px-6 py-3">Full Name</th>
                <th className="px-6 py-3">Email Address</th>
                <th className="px-6 py-3">Access Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-gray-650 font-medium">
              {staff.map((member) => {
                const isSelf = member.email === mongoAdmin?.email;
                return (
                  <tr key={member._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-1.5">
                      <span>{member.name}</span>
                      {isSelf && (
                        <span className="text-[8px] bg-black text-white px-1.5 py-0.5 rounded font-bold uppercase scale-90">You</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono">{member.email}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-800">{member.role?.name || 'Admin'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${
                        member.status === 'active'
                          ? 'bg-green-50 text-green-700 border-green-150'
                          : 'bg-red-50 text-red-700 border-red-150'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(member.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                      <button
                        onClick={() => handleToggleStatus(member)}
                        disabled={isSelf}
                        className={`inline-flex items-center gap-0.5 font-bold py-1 px-2 rounded uppercase text-[9px] tracking-wide cursor-pointer border ${
                          member.status === 'active'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 disabled:opacity-50'
                            : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 disabled:opacity-50'
                        }`}
                        title={member.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                      >
                        {member.status === 'active' ? (
                          <>
                            <UserX size={10} /> Suspend
                          </>
                        ) : (
                          <>
                            <UserCheck size={10} /> Activate
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteStaff(member._id, member.email)}
                        disabled={isSelf}
                        className="inline-flex items-center gap-0.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold py-1 px-2 rounded uppercase text-[9px] tracking-wide cursor-pointer disabled:opacity-50"
                        title="Delete Profile"
                      >
                        <Trash2 size={10} /> Delete
                      </button>
                    </td>
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
