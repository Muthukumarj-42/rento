'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, MapPin, Star } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { MOCK_PRODUCTS } from '@/lib/data';

const SAVED = MOCK_PRODUCTS.slice(0, 5);

export default function FavoritesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Saved Items</h1>
        <p className="text-gray-500 mt-1">{SAVED.length} items saved</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SAVED.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group"
          >
            <div className="relative">
              <img
                src={product.images?.[0]?.image_url}
                alt={product.title}
                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow">
                <Heart size={14} className="fill-red-500 text-red-500" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                <MapPin size={10} />
                {product.area}, {product.city}
              </div>
              <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2">{product.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-black">{formatINR(product.price_per_day)}<span className="text-xs font-normal text-gray-400">/day</span></span>
                <Link href={`/product/${product.id}`} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors">
                  Rent Now
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
