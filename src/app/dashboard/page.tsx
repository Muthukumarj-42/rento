'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Heart, Package, ArrowRight, Star, MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { formatINR, formatDate, getBookingStatusColor } from '@/lib/utils';
import { MOCK_PRODUCTS } from '@/lib/data';

const MOCK_BOOKINGS = [
  {
    id: 'b1',
    product: MOCK_PRODUCTS[0],
    start_date: '2024-04-01',
    end_date: '2024-04-03',
    total_amount: 8127,
    status: 'active' as const,
  },
  {
    id: 'b2',
    product: MOCK_PRODUCTS[2],
    start_date: '2024-04-10',
    end_date: '2024-04-12',
    total_amount: 927,
    status: 'pending' as const,
  },
  {
    id: 'b3',
    product: MOCK_PRODUCTS[4],
    start_date: '2024-03-15',
    end_date: '2024-03-18',
    total_amount: 2727,
    status: 'completed' as const,
  },
];

const STATS = [
  { icon: Calendar, label: 'Total Bookings', value: '8', color: 'text-blue-600 bg-blue-50' },
  { icon: Package, label: 'Active Rentals', value: '1', color: 'text-green-600 bg-green-50' },
  { icon: Heart, label: 'Saved Items', value: '12', color: 'text-red-500 bg-red-50' },
  { icon: Star, label: 'Avg. Rating Given', value: '4.8', color: 'text-yellow-600 bg-yellow-50' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900">
          Welcome back, {user?.full_name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s an overview of your rental activity.</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={18} />
            </div>
            <div className="text-2xl font-black text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Active Rentals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Bookings</h2>
          <Link href="/dashboard/bookings" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="divide-y divide-gray-50">
          {MOCK_BOOKINGS.map((booking) => (
            <div key={booking.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              <img
                src={booking.product.images?.[0]?.image_url}
                alt={booking.product.title}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{booking.product.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock size={11} className="text-gray-400" />
                  <p className="text-xs text-gray-500">
                    {formatDate(booking.start_date)} – {formatDate(booking.end_date)}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin size={10} className="text-gray-400" />
                  <p className="text-xs text-gray-500">{booking.product.city}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900 text-sm">{formatINR(booking.total_amount)}</p>
                <Badge className={`text-xs mt-1 border-0 ${getBookingStatusColor(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Browse CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex items-center justify-between"
      >
        <div>
          <h3 className="font-bold text-lg">Find your next rental</h3>
          <p className="text-blue-100 text-sm mt-0.5">2,400+ products available in Coimbatore</p>
        </div>
        <Link
          href="/browse"
          className="px-5 py-2.5 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2"
        >
          Browse Now <ArrowRight size={14} />
        </Link>
      </motion.div>
    </div>
  );
}
