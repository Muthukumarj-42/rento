'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Truck, Package, Shield, ChevronRight, Loader2 } from 'lucide-react';
import { type Product, type DeliveryType } from '@/types';
import { formatINR, calculatePrice, daysBetween, loadRazorpay } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

interface BookingPanelProps {
  product: Product;
  onAuthRequired: () => void;
}

export function BookingPanel({ product, onAuthRequired }: BookingPanelProps) {
  const { user } = useAuthStore();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup');
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const pricing = useMemo(() => {
    if (!startDate || !endDate) return null;
    const days = daysBetween(new Date(startDate), new Date(endDate));
    return calculatePrice(product.price_per_day, product.deposit_amount, days);
  }, [startDate, endDate, product.price_per_day, product.deposit_amount]);

  const handleBook = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please select rental dates');
      return;
    }
    if (!pricing) return;

    setLoading(true);
    try {
      // Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Payment gateway failed to load. Please try again.');
        return;
      }

      // Create order
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          startDate,
          endDate,
          deliveryType,
          totalAmount: pricing.totalAmount,
          renterId: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      // Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: pricing.totalAmount * 100,
        currency: 'INR',
        name: 'Rento',
        description: `Rental: ${product.title}`,
        order_id: data.orderId,
        prefill: {
          name: user.full_name,
          email: user.email,
          contact: user.phone,
        },
        theme: { color: '#2563eb' },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          // Verify and create booking
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, bookingData: data.bookingData }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            toast.success('🎉 Booking confirmed! Check your dashboard for updates.');
            window.location.href = `/dashboard/bookings/${verifyData.bookingId}`;
          } else {
            toast.error('Payment verification failed. Contact support.');
          }
        },
      };

      const rzp = new (window as unknown as { Razorpay: new (opts: typeof options) => { open: () => void } }).Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky top-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
      >
        {/* Price header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-blue-600">
              {formatINR(product.price_per_day)}
            </span>
            <span className="text-gray-500 text-sm">/ day</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">+ {formatINR(product.deposit_amount)} refundable deposit</span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Date pickers */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              Rental Dates
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Start</label>
                <div className="relative">
                  <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    min={today}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (endDate && e.target.value >= endDate) setEndDate('');
                    }}
                    className="w-full pl-9 pr-2 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">End</label>
                <div className="relative">
                  <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-2 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    disabled={!startDate}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery type */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              Delivery Option
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'pickup', label: 'Self Pickup', icon: Package },
                { value: 'delivery', label: 'Home Delivery', icon: Truck },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDeliveryType(opt.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                    deliveryType === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <opt.icon size={14} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          {pricing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2 p-4 bg-gray-50 rounded-xl text-sm"
            >
              <div className="flex justify-between text-gray-600">
                <span>{formatINR(product.price_per_day)} × {pricing.days} day{pricing.days > 1 ? 's' : ''}</span>
                <span>{formatINR(pricing.rentalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Refundable Deposit</span>
                <span>{formatINR(pricing.depositAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform Fee (2.5%)</span>
                <span>{formatINR(pricing.platformFee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18% on fee)</span>
                <span>{formatINR(pricing.gstAmount)}</span>
              </div>
              <div className="flex justify-between font-black text-gray-900 pt-2 border-t border-gray-200 text-base">
                <span>Total</span>
                <span>{formatINR(pricing.totalAmount)}</span>
              </div>
            </motion.div>
          )}

          {/* Book button */}
          <Button
            onClick={handleBook}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-base"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : !startDate || !endDate ? (
              'Select Dates to Book'
            ) : (
              <>Book Now — {pricing && formatINR(pricing.totalAmount)} <ChevronRight size={16} /></>
            )}
          </Button>

          <p className="text-center text-xs text-gray-400">
            You won&apos;t be charged until the owner accepts your booking
          </p>

          {/* Trust badge */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
            <Shield size={16} className="text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-900">24/7 Rental Support</p>
              <p className="text-xs text-blue-600">Rento Premium Coverage</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
