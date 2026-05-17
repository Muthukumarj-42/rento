'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, Package, Search, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<'customers' | 'owners'>('customers');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const role = tab === 'customers' ? 'customer' : 'owner';

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false });

      setUsers(data || []);
      setLoading(false);
    };
    fetchUsers();
  }, [tab]);

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">Manage customers and owners on the platform</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTab('customers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            tab === 'customers' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
          }`}
        >
          <Users size={16} /> Customers
        </button>
        <button
          onClick={() => setTab('owners')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            tab === 'owners' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
          }`}
        >
          <Package size={16} /> Owners
        </button>

        {/* Search */}
        <div className="ml-auto relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl w-64 focus:outline-none focus:border-blue-400 bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-blue-600" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Users size={32} className="mx-auto mb-2 text-gray-300" />
            No {tab} found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left px-6 py-3">Name</th>
                  <th className="text-left px-6 py-3">Email</th>
                  <th className="text-left px-6 py-3">City</th>
                  {tab === 'owners' && <th className="text-left px-6 py-3">KYC</th>}
                  <th className="text-left px-6 py-3">Joined</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{u.full_name || 'Unnamed'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.city || '—'}</td>
                    {tab === 'owners' && (
                      <td className="px-6 py-4">
                        {u.kyc_status === 'verified' ? (
                          <span className="flex items-center gap-1 text-xs text-green-700 font-semibold">
                            <ShieldCheck size={13} /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                            <ShieldAlert size={13} /> {u.kyc_status || 'Pending'}
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 text-xs text-gray-400">{formatDate(u.created_at)}</td>
                    <td className="px-6 py-4">
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">Active</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <p className="text-xs text-gray-400 text-center">
        Showing {filtered.length} of {users.length} {tab}
      </p>
    </div>
  );
}
