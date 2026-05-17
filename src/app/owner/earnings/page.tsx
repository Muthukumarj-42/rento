'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Package, Calendar, Loader2, ArrowUpRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { formatINR, getBookingStatusColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';

export default function OwnerEarningsPage() {
  const { user } = useAuthStore();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0, monthlyEarnings: 0, activeRentals: 0, completedBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // All bookings for this owner
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('*, product:products(title, product_images(image_url))')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (allBookings) {
        const total = allBookings.reduce((s, b) => s + (b.total_price || 0), 0);
        const monthly = allBookings
          .filter(b => b.created_at >= monthStart)
          .reduce((s, b) => s + (b.total_price || 0), 0);
        const active = allBookings.filter(b => b.status === 'active').length;
        const completed = allBookings.filter(b => b.status === 'completed').length;

        setStats({ totalEarnings: total, monthlyEarnings: monthly, activeRentals: active, completedBookings: completed });
        setRecentBookings(allBookings.slice(0, 8).map(b => ({
          ...b,
          product: b.product ? {
            ...b.product,
            images: (b.product.product_images || []).map((img: any) => ({ image_url: img.image_url })),
          } : null,
        })));

        // Build monthly chart data from last 6 months
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const chart = Array.from({ length: 6 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (5 - i));
          const monthLabel = months[d.getMonth()];
          const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const revenue = allBookings
            .filter(b => b.created_at?.startsWith(monthStr))
            .reduce((s, b) => s + (b.total_price || 0), 0);
          return { month: monthLabel, revenue };
        });
        setChartData(chart);
      }
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

  const STAT_CARDS = [
    { icon: DollarSign, label: 'Total Earnings', value: formatINR(stats.totalEarnings), sub: 'All time', color: 'text-blue-600 bg-blue-50' },
    { icon: TrendingUp, label: 'This Month', value: formatINR(stats.monthlyEarnings), sub: 'Current month', color: 'text-green-600 bg-green-50' },
    { icon: Package, label: 'Active Rentals', value: stats.activeRentals.toString(), sub: 'Currently out', color: 'text-purple-600 bg-purple-50' },
    { icon: Calendar, label: 'Completed', value: stats.completedBookings.toString(), sub: 'Finished rentals', color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-gray-900">Earnings</h1>
        <p className="text-gray-500 mt-1">Track your rental income and booking performance</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {STAT_CARDS.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon size={18} />
            </div>
            <div className="text-2xl font-black text-gray-900">{card.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{card.label}</div>
            <div className="text-xs text-gray-500 mt-1">{card.sub}</div>
          </div>
        ))}
      </motion.div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
            <ArrowUpRight size={14} /> Growing
          </div>
        </div>
        {chartData.some(d => d.revenue > 0) ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
                <Tooltip formatter={v => [formatINR(Number(v)), 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
            <div className="text-center">
              <TrendingUp size={32} className="mx-auto mb-2 text-gray-300" />
              No revenue data yet. Start accepting bookings!
            </div>
          </div>
        )}
      </motion.div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Booking History</h2>
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
                {recentBookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                          {b.product?.images?.[0]?.image_url ? (
                            <img src={b.product.images[0].image_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-gray-400" /></div>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">{b.product?.title || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {b.start_date} → {b.end_date}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatINR(b.total_price || 0)}</td>
                    <td className="px-6 py-4">
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
          <div className="px-6 py-12 text-center text-gray-500 text-sm">
            No booking history yet. Your completed bookings will appear here.
          </div>
        )}
      </motion.div>
    </div>
  );
}
