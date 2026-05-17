'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Package, Calendar, DollarSign, Loader2, Plus, TrendingUp, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatINR, getBookingStatusColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';

const REVENUE_DATA = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 18500 },
  { month: 'Mar', revenue: 14200 },
  { month: 'Apr', revenue: 22000 },
  { month: 'May', revenue: 31000 },
  { month: 'Jun', revenue: 38500 },
];

export default function OwnerDashboard() {
  const { user } = useAuthStore();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ listings: 0, activeBookings: 0, totalEarnings: 0 });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Listings count
      const { count: listingsCount } = await supabase
        .from('products').select('*', { count: 'exact', head: true }).eq('owner_id', user.id);

      // Active bookings
      const { count: activeCount } = await supabase
        .from('bookings').select('*', { count: 'exact', head: true }).eq('owner_id', user.id).eq('status', 'active');

      // Recent bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, product:products(title)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Top products
      const { data: prods } = await supabase
        .from('products')
        .select('*, product_images(image_url, order)')
        .eq('owner_id', user.id)
        .order('review_count', { ascending: false })
        .limit(3);

      setStats({
        listings: listingsCount || 0,
        activeBookings: activeCount || 0,
        totalEarnings: (bookings || []).reduce((sum: number, b: any) => sum + (b.total_price || 0), 0),
      });
      setRecentBookings(bookings || []);
      setTopProducts((prods || []).map(p => ({
        ...p,
        images: (p.product_images || []).map((img: any) => ({ image_url: img.image_url })),
      })));
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-black text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.full_name?.split(' ')[0]} 👋</p>
        </div>
        <Link
          href="/owner/listings/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> List New Product
        </Link>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <DollarSign size={18} className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">Total Earnings</p>
          </div>
          <p className="text-3xl font-black text-gray-900">{formatINR(stats.totalEarnings)}</p>
          <p className="text-xs text-gray-400 mt-1">from confirmed bookings</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Calendar size={18} className="text-green-600" />
            </div>
            <p className="text-sm text-gray-500">Active Rentals</p>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.activeBookings}</p>
          <p className="text-xs text-gray-400 mt-1">currently rented out</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Package size={18} className="text-purple-600" />
            </div>
            <p className="text-sm text-gray-500">My Listings</p>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.listings}</p>
          <Link href="/owner/listings" className="text-xs text-blue-600 hover:underline mt-1 block">Manage listings →</Link>
        </div>
      </motion.div>

      {/* Revenue chart + Top performing */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-gray-900">Revenue Growth</h2>
            <span className="text-xs text-gray-400">Projected trend</span>
          </div>
          <p className="text-xs text-gray-400 mb-6">Jan 2024 – Jun 2024</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip formatter={(value) => [formatINR(Number(value)), 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top performing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">My Listings</h2>
          <div className="space-y-4">
            {topProducts.length > 0 ? topProducts.map((product) => (
              <div key={product.id} className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                  {product.images?.[0]?.image_url ? (
                    <img src={product.images[0].image_url} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={20} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{product.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatINR(product.price_per_day)}/day</p>
                </div>
                <Zap size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                <Package size={32} className="mx-auto mb-2 text-gray-300" />
                No listings yet
              </div>
            )}
          </div>
          <Link href="/owner/listings" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-5 font-semibold">
            View All Listings <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Bookings</h2>
          <Link href="/owner/bookings" className="text-xs text-blue-600 hover:underline">View all →</Link>
        </div>

        {recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-6 py-3">Product</th>
                  <th className="text-left px-6 py-3">Dates</th>
                  <th className="text-left px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate max-w-[180px]">{booking.product?.title || 'N/A'}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {booking.start_date} → {booking.end_date}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatINR(booking.total_price)}</td>
                    <td className="px-6 py-4">
                      <Badge className={`text-xs border-0 ${getBookingStatusColor(booking.status)}`}>
                        {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">
            No bookings yet. Share your listings to start earning!
          </div>
        )}
      </motion.div>
    </div>
  );
}
