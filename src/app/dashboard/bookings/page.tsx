'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, MapPin, ArrowRight, Package, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatINR, formatDate, getBookingStatusColor } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';

const STATUS_TABS = ['All', 'Active', 'Pending', 'Completed', 'Cancelled'];

export default function BookingsPage() {
  const { user } = useAuthStore();
  const supabase = createClient();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, product:products(title, city, area, product_images(image_url, order))')
        .eq('renter_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setBookings(data.map(b => ({
          ...b,
          product: b.product ? {
            ...b.product,
            images: (b.product.product_images || []).map((img: any) => ({ image_url: img.image_url })),
          } : null,
        })));
      }
      setLoading(false);
    };
    fetchBookings();
  }, [user]);

  const filtered = activeTab === 'All'
    ? bookings
    : bookings.filter(b => b.status?.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">Track all your rental requests and history</p>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-1.5 text-sm font-semibold rounded-full border transition-all ${
              activeTab === tab ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-blue-600" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Package size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">No bookings found</h3>
          <p className="text-sm text-gray-500 mb-5">
            {activeTab === 'All' ? "You haven't made any bookings yet." : `No ${activeTab.toLowerCase()} bookings.`}
          </p>
          <Link href="/browse" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
            Browse Rentals
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="flex items-start gap-4 p-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {booking.product?.images?.[0]?.image_url ? (
                    <img src={booking.product.images[0].image_url} alt={booking.product?.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">
                      {booking.product?.title || 'Product'}
                    </h3>
                    <Badge className={`text-xs border-0 flex-shrink-0 ${getBookingStatusColor(booking.status)}`}>
                      {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <MapPin size={10} /> {booking.product?.city || '—'}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <Clock size={10} />
                    {booking.start_date && booking.end_date
                      ? `${formatDate(booking.start_date)} – ${formatDate(booking.end_date)}`
                      : 'Dates pending'}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="font-black text-blue-600">{formatINR(booking.total_price || 0)}</span>
                      <span className="text-xs text-gray-400 ml-1">total paid</span>
                    </div>
                  </div>
                </div>
              </div>

              {booking.status === 'pending' && (
                <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-100 flex items-center justify-between">
                  <p className="text-xs text-yellow-700 font-medium">⏳ Waiting for owner to accept</p>
                </div>
              )}
              {booking.status === 'active' && (
                <div className="px-4 py-3 bg-green-50 border-t border-green-100">
                  <p className="text-xs text-green-700 font-medium">✅ Rental is active — enjoy!</p>
                </div>
              )}
              {booking.status === 'completed' && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-500">Rental completed · Deposit refunded in 3–5 days</p>
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">Leave Review</button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
