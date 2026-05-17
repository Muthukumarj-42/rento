'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatINR, formatDate, getBookingStatusColor } from '@/lib/utils';
import { MOCK_PRODUCTS } from '@/lib/data';

const MOCK_BOOKINGS = [
  { id: 'b1', product: MOCK_PRODUCTS[0], start_date: '2024-04-01', end_date: '2024-04-03', total_amount: 8127, status: 'active', days: 3 },
  { id: 'b2', product: MOCK_PRODUCTS[2], start_date: '2024-04-10', end_date: '2024-04-12', total_amount: 927, status: 'pending', days: 2 },
  { id: 'b3', product: MOCK_PRODUCTS[4], start_date: '2024-03-15', end_date: '2024-03-18', total_amount: 2727, status: 'completed', days: 3 },
  { id: 'b4', product: MOCK_PRODUCTS[1], start_date: '2024-03-01', end_date: '2024-03-03', total_amount: 11900, status: 'completed', days: 3 },
  { id: 'b5', product: MOCK_PRODUCTS[6], start_date: '2024-02-20', end_date: '2024-02-22', total_amount: 3950, status: 'cancelled', days: 2 },
];

const STATUS_TABS = ['All', 'Active', 'Pending', 'Completed', 'Cancelled'];

export default function BookingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">Track all your rental requests and history</p>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {STATUS_TABS.map((tab, i) => (
          <button
            key={tab}
            className={`flex-shrink-0 px-4 py-1.5 text-sm font-semibold rounded-full border transition-all ${
              i === 0 ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {MOCK_BOOKINGS.map((booking, i) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="flex items-start gap-4 p-4">
              <img
                src={booking.product.images?.[0]?.image_url}
                alt={booking.product.title}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">
                    {booking.product.title}
                  </h3>
                  <Badge className={`text-xs border-0 flex-shrink-0 ${getBookingStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <MapPin size={10} />
                  {booking.product.city}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <Clock size={10} />
                  {formatDate(booking.start_date)} – {formatDate(booking.end_date)} · {booking.days} days
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="font-black text-blue-600">{formatINR(booking.total_amount)}</span>
                    <span className="text-xs text-gray-400 ml-1">total paid</span>
                  </div>
                  <Link
                    href={`/dashboard/bookings/${booking.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Details <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Action strip */}
            {booking.status === 'pending' && (
              <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-100 flex items-center justify-between">
                <p className="text-xs text-yellow-700 font-medium">⏳ Waiting for owner to accept</p>
                <button className="text-xs font-semibold text-red-500 hover:text-red-600">Cancel Request</button>
              </div>
            )}
            {booking.status === 'active' && (
              <div className="px-4 py-3 bg-green-50 border-t border-green-100 flex items-center justify-between">
                <p className="text-xs text-green-700 font-medium">✅ Rental is active — enjoy!</p>
                <Link href={`/dashboard/messages`} className="text-xs font-semibold text-blue-600">
                  Message Owner
                </Link>
              </div>
            )}
            {booking.status === 'completed' && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">Rental completed · Deposit will be refunded in 3–5 days</p>
                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">Leave Review</button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
