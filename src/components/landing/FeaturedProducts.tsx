'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';

export function FeaturedProducts() {
  const featured = MOCK_PRODUCTS.filter((p) => p.is_featured).slice(0, 4);

  return (
    <section className="section bg-gray-50/50">
      <div className="container-main">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-2"
            >
              Featured
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-3xl md:text-4xl font-black text-gray-900"
            >
              Top Picks in Coimbatore
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 mt-2"
            >
              Handpicked, verified rentals loved by the community
            </motion.p>
          </div>
          <Link
            href="/browse?featured=true"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
