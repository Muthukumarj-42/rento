'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '@/lib/data';

const CATEGORY_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-100',
  'bg-purple-50 text-purple-700 border-purple-100',
  'bg-green-50 text-green-700 border-green-100',
  'bg-orange-50 text-orange-700 border-orange-100',
  'bg-pink-50 text-pink-700 border-pink-100',
  'bg-teal-50 text-teal-700 border-teal-100',
  'bg-indigo-50 text-indigo-700 border-indigo-100',
  'bg-yellow-50 text-yellow-700 border-yellow-100',
  'bg-red-50 text-red-700 border-red-100',
  'bg-cyan-50 text-cyan-700 border-cyan-100',
];

export function CategoryGrid() {
  return (
    <section className="section bg-white">
      <div className="container-main">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-2"
            >
              Explore Categories
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-3xl md:text-4xl font-black text-gray-900"
            >
              Find exactly what you need
            </motion.h2>
          </div>
          <Link
            href="/browse"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/browse?category=${cat.slug}`}
                className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </span>
                <div className="text-center">
                  <p className="text-sm font-semibold leading-tight">{cat.name}</p>
                  {cat.description && (
                    <p className="text-xs opacity-70 mt-0.5 leading-tight line-clamp-1">
                      {cat.description}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
