'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Shield, Clock } from 'lucide-react';

const OWNER_BENEFITS = [
  { icon: TrendingUp, label: 'Earn ₹15,000–₹80,000/month from idle equipment' },
  { icon: Shield, label: 'Damage protection & ₹10L insurance coverage' },
  { icon: Clock, label: 'You control availability, pricing & bookings' },
];

export function OwnerCTA() {
  return (
    <section className="section">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-14 md:px-16 text-white"
        >
          {/* Background blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm font-medium mb-5">
                💸 For Rental Owners
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4">
                Start Earning From Your Unused Products
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-6">
                Your idle camera, drone, or tools can earn you real money. List it on Rento and connect with thousands of renters in your city — for free.
              </p>

              <ul className="flex flex-col gap-3 mb-8">
                {OWNER_BENEFITS.map((b, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <b.icon size={16} />
                    </div>
                    <span className="text-sm text-blue-50">{b.label}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/owner"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm"
                >
                  List Your First Product <ArrowRight size={16} />
                </Link>
                <Link
                  href="/owner#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm"
                >
                  How Owner Onboarding Works
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '₹15K', label: 'Avg. monthly earnings', sub: 'per owner' },
                { value: '48h', label: 'Avg. first booking', sub: 'after listing' },
                { value: '2,400+', label: 'Active products', sub: 'across Tamil Nadu' },
                { value: 'Free', label: 'To list & join', sub: 'no subscription fee' },
              ].map((stat, i) => (
                <div key={i} className="p-5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="text-3xl font-black mb-1">{stat.value}</div>
                  <div className="text-blue-100 text-xs font-medium">{stat.label}</div>
                  <div className="text-blue-200 text-xs mt-0.5">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
