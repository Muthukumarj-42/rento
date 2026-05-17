'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Package, Calendar, CreditCard, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatINR, getBookingStatusColor } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0, owners: 0, customers: 0,
    activeListings: 0, totalBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [
        { count: usersCount },
        { count: ownersCount },
        { count: listingsCount },
        { count: bookingsCount },
        { data: bookings },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'owner'),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*, product:products(title), renter:profiles!bookings_renter_id_fkey(full_name)')
          .order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        totalUsers: usersCount || 0,
        owners: ownersCount || 0,
        customers: (usersCount || 0) - (ownersCount || 0),
        activeListings: listingsCount || 0,
        totalBookings: bookingsCount || 0,
      });
      setRecentBookings(bookings || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const ADMIN_STATS = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers.toString(), sub: `${stats.owners} owners · ${stats.customers} customers`, color: 'text-blue-600 bg-blue-50' },
    { icon: Package, label: 'Active Listings', value: stats.activeListings.toString(), sub: 'Live on marketplace', color: 'text-green-600 bg-green-50' },
    { icon: Calendar, label: 'Total Bookings', value: stats.totalBookings.toString(), sub: 'All time', color: 'text-purple-600 bg-purple-50' },
    { icon: CreditCard, label: 'Platform Revenue', value: formatINR(2840000), sub: '↑ 18.4% MoM', color: 'text-orange-600 bg-orange-50' },
    { icon: TrendingUp, label: 'Avg. Booking Value', value: formatINR(4850), sub: '↑ 6.2% MoM', color: 'text-teal-600 bg-teal-50' },
    { icon: AlertTriangle, label: 'Open Disputes', value: '2', sub: 'Needs review', color: 'text-red-500 bg-red-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 mt-1">Manage the entire Rento marketplace</p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        {ADMIN_STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-9 h-9 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={17} />
            </div>
            <div className="text-xl font-black text-gray-900 leading-tight">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-0.5 leading-tight">{stat.label}</div>
            <div className="text-xs text-green-600 font-medium mt-1">{stat.sub}</div>
          </div>
        ))}
      </motion.div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-xs text-blue-600 hover:underline">View all</Link>
        </div>

        {recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Product</th>
                  <th className="text-left px-5 py-3">Renter</th>
                  <th className="text-left px-5 py-3">Amount</th>
                  <th className="text-left px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900 truncate max-w-[200px]">{b.product?.title || 'N/A'}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{b.renter?.full_name || '—'}</td>
                    <td className="px-5 py-3 text-sm font-bold text-gray-900">{formatINR(b.total_price)}</td>
                    <td className="px-5 py-3">
                      <Badge className={`text-xs border-0 ${getBookingStatusColor(b.status)}`}>
                        {b.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">No bookings yet.</div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: Users, label: 'Manage Users', href: '/admin/users', color: 'bg-blue-600' },
          { icon: Package, label: 'All Listings', href: '/admin/listings', color: 'bg-green-600' },
          { icon: AlertTriangle, label: 'Handle Disputes', href: '/admin/disputes', color: 'bg-orange-500' },
          { icon: CreditCard, label: 'View Reports', href: '/admin/analytics', color: 'bg-purple-600' },
        ].map(({ icon: Icon, label, href, color }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
          >
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
              <Icon size={18} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors text-center">{label}</span>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
