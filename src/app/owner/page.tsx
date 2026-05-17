'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatINR, getBookingStatusColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MOCK_PRODUCTS } from '@/lib/data';

const REVENUE_DATA = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 18500 },
  { month: 'Mar', revenue: 14200 },
  { month: 'Apr', revenue: 22000 },
  { month: 'May', revenue: 31000 },
  { month: 'Jun', revenue: 38500 },
];

const TOP_PRODUCTS = [
  { product: MOCK_PRODUCTS[0], earned: 28000 },
  { product: MOCK_PRODUCTS[1], earned: 21000 },
  { product: MOCK_PRODUCTS[5], earned: 15500 },
];

const RECENT_BOOKINGS = [
  { id: 'rb1', renter: 'Priya R.', product: 'Sony Alpha A7S III', amount: 8127, status: 'active', days: 3 },
  { id: 'rb2', renter: 'Arun K.', product: 'DJI Mavic 3 Pro', amount: 12250, status: 'pending', days: 3 },
  { id: 'rb3', renter: 'Meena S.', product: 'Studio Lighting Kit', amount: 3596, status: 'completed', days: 4 },
  { id: 'rb4', renter: 'Ravi M.', product: 'Sony Alpha A7S III', amount: 5500, status: 'rejected', days: 2 },
];

export default function OwnerDashboard() {
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
          <p className="text-gray-500 mt-1">Track your rental performance and earnings</p>
        </div>
        <Link
          href="/owner/listings/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors"
        >
          + List New Product
        </Link>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {/* Total Earnings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Total Earnings</p>
          <p className="text-3xl font-black text-gray-900">
            {formatINR(136200)}
            <span className="text-sm font-semibold text-green-500 ml-2">↑ 12.4%</span>
          </p>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: '68%' }} />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">68% of monthly target</p>
        </div>

        {/* Active Rentals */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Active Rentals</p>
          <p className="text-3xl font-black text-gray-900">
            12
            <span className="text-base font-normal text-gray-400 ml-2">/ 15 total assets</span>
          </p>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: '80%' }} />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">80% utilization rate</p>
        </div>

        {/* Pending Bookings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Pending Bookings</p>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-black text-gray-900">05</p>
            <Badge className="bg-orange-100 text-orange-700 border-0">ATTENTION</Badge>
          </div>
          <p className="text-xs text-red-500 mt-3 font-medium">⏰ Next request expires in 2 hours</p>
          <Link href="/owner/bookings" className="text-xs text-blue-600 hover:underline mt-1 block">
            Review all requests →
          </Link>
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
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none">
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
            </select>
          </div>
          <p className="text-xs text-gray-400 mb-6">Jan 2024 – Jun 2024</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v / 1000}K`}
                />
                <Tooltip
                  formatter={(value) => [formatINR(Number(value)), 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
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
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top Performing</h2>
          <div className="space-y-4">
            {TOP_PRODUCTS.map(({ product, earned }, i) => (
              <div key={product.id} className="flex items-start gap-3">
                <img
                  src={product.images?.[0]?.image_url}
                  alt={product.title}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{product.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatINR(earned)} earned this month</p>
                </div>
                <Zap size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
          <Link href="/owner/listings" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-5 font-semibold">
            View All Assets <ArrowRight size={14} />
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
          <div className="flex items-center gap-2">
            {['All', 'In Progress', 'Returned'].map((tab, i) => (
              <button
                key={tab}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  i === 0 ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left px-6 py-3">Renter</th>
                <th className="text-left px-6 py-3">Product</th>
                <th className="text-left px-6 py-3">Amount</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {RECENT_BOOKINGS.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.renter}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[200px]">{booking.product}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatINR(booking.amount)}</td>
                  <td className="px-6 py-4">
                    <Badge className={`text-xs border-0 ${getBookingStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {booking.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                          Accept
                        </button>
                        <button className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                          Reject
                        </button>
                      </div>
                    )}
                    {booking.status !== 'pending' && (
                      <Link href={`/owner/bookings/${booking.id}`} className="text-xs text-blue-600 hover:underline">
                        View details
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
