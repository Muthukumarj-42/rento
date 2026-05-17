'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Heart, Star, MapPin, Shield } from 'lucide-react';
import { type Product } from '@/types';
import { formatINR } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const mainImage = product.images?.[0]?.image_url;

  return (
    <Link href={`/product/${product.id}`} className="block group">
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/3] bg-gray-100">
          {mainImage && (
            <img
              src={mainImage}
              alt={product.title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
          )}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
          >
            <Heart
              size={15}
              className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}
            />
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.is_featured && (
              <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5 border-0">
                Featured
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Category + verified */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs text-gray-400">{product.category?.name}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
              <Shield size={10} />
              Verified
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
            <MapPin size={10} />
            <span>{product.area}, {product.city}</span>
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-3">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
              {product.review_count && (
                <span className="text-xs text-gray-400">({product.review_count})</span>
              )}
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
            <div>
              <span className="text-xl font-black text-blue-600">
                {formatINR(product.price_per_day)}
              </span>
              <span className="text-xs text-gray-400">/day</span>
            </div>
            <div className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl group-hover:bg-blue-700 transition-colors">
              Rent Now
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
