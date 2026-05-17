'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Package, Calendar, CreditCard, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatINR, getBookingStatusColor, getProductStatusColor } from '@/lib/utils';
import { MOCK_PRODUCTS } from '@/lib/data';

const ADMIN_STATS = [
  { icon: Users, label: 'Total Users', value: '1,284', change: '+48 this week', color: 'text-blue-600 bg-blue-50' },
  { icon: Package, label: 'Active Listings', value: '2,410', change: '+124 this month', color: 'text-green-600 bg-green-50' },
  { icon: Calendar, label: 'Total Bookings', value: '5,832', change: '+312 this month', color: 'text-purple-600 bg-purple-50' },
  { icon: CreditCard, label: 'Platform Revenue', value: formatINR(2840000), change: '↑ 18.4% MoM', color: 'text-orange-600 bg-orange-50' },
  { icon: AlertTriangle, label: 'Pending Approvals', value: '7', change: '3 owners, 4 listings', color: 'text-red-500 bg-red-50' },
  { icon: TrendingUp, label: 'Avg. Booking Value', value: formatINR(4850), change: '↑ 6.2% MoM', color: 'text-teal-600 bg-teal-50' },
];

const PENDING_LISTINGS = MOCK_PRODUCTS.slice(0, 4).map((p) => ({
  ...p,
  status: 'pending_approval' as const,
  owner_name: p.owner?.full_name ?? 'Unknown Owner',
}));

const RECENT_TRANSACTIONS = [
  { id: 't1', user: 'Priya R.', product: 'Sony Alpha A7S III', amount: 8127, status: 'paid', date: '2024-04-01' },
  { id: 't2', user: 'Arun K.', product: 'DJI Mavic 3 Pro', amount: 12250, status: 'paid', date: '2024-04-02' },
  { id: 't3', user: 'Meena S.', product: 'Trek FX3 Bike', amount: 927, status: 'refunded', date: '2024-04-03' },
  { id: 't4', user: 'Ravi M.', product: 'DeWalt Tool Set', amount: 2727, status: 'paid', date: '2024-04-03' },
];

export default function AdminDashboard() {
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
        {ADMIN_STATS.map((stat, i) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-9 h-9 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={17} />
            </div>
            <div className="text-xl font-black text-gray-900 leading-tight">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-0.5 leading-tight">{stat.label}</div>
            <div className="text-xs text-green-600 font-medium mt-1">{stat.change}</div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Listings Approval */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-900">Pending Approvals</h2>
              <p className="text-xs text-gray-400 mt-0.5">Review and approve listings</p>
            </div>
            <Badge className="bg-orange-100 text-orange-700 border-0">4 listings</Badge>
          </div>

          <div className="divide-y divide-gray-50">
            {PENDING_LISTINGS.map((listing) => (
              <div key={listing.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                <img
                  src={listing.images?.[0]?.image_url}
                  alt={listing.title}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{listing.title}</p>
                  <p className="text-xs text-gray-500">{listing.owner_name} · {listing.city}</p>
                  <Badge className={`text-xs mt-1 border-0 ${getProductStatusColor('pending_approval')}`}>
                    Pending Review
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1">
                    <CheckCircle size={12} /> Approve
                  </button>
                  <button className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100">
            <Link href="/admin/listings" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              View all pending listings →
            </Link>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Transactions</h2>
            <Link href="/admin/payments" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3">User</th>
                  <th className="text-left px-5 py-3">Amount</th>
                  <th className="text-left px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {RECENT_TRANSACTIONS.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold text-gray-900">{tx.user}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[150px]">{tx.product}</p>
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-gray-900">{formatINR(tx.amount)}</td>
                    <td className="px-5 py-3">
                      <Badge className={`text-xs border-0 ${tx.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: Users, label: 'Manage Users', href: '/admin/users', color: 'bg-blue-600' },
          { icon: Package, label: 'Review Listings', href: '/admin/listings', color: 'bg-green-600' },
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
