'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';

export function PopularNearYou() {
  const popular = MOCK_PRODUCTS.slice(0, 8);

  return (
    <section className="section bg-white">
      <div className="container-main">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-2"
            >
              Popular Near You
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-3xl md:text-4xl font-black text-gray-900"
            >
              Trending in{' '}
              <span className="inline-flex items-center gap-1 text-blue-600">
                <MapPin size={28} />
                Coimbatore
              </span>
            </motion.h2>
          </div>
          <Link
            href="/browse?city=Coimbatore"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            See more <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {popular.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
