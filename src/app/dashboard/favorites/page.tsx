'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, MapPin, Star, Loader2, Package } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';

export default function FavoritesPage() {
  const { user } = useAuthStore();
  const supabase = createClient();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchFavorites = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('*, product:products(*, product_images(image_url, order))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setFavorites(data.map(f => ({
          ...f,
          product: f.product ? {
            ...f.product,
            images: (f.product.product_images || []).map((img: any) => ({ image_url: img.image_url })),
          } : null,
        })));
      }
      setLoading(false);
    };
    fetchFavorites();
  }, [user]);

  const removeFavorite = async (id: string) => {
    await supabase.from('favorites').delete().eq('id', id);
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Saved Items</h1>
        <p className="text-gray-500 mt-1">{favorites.length} item{favorites.length !== 1 ? 's' : ''} saved</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-blue-600" size={28} />
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Heart size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">No saved items</h3>
          <p className="text-sm text-gray-500 mb-5">Save products by tapping the heart icon on any listing.</p>
          <Link href="/browse" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
            Browse Rentals
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((fav, i) => {
            const product = fav.product;
            if (!product) return null;
            return (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group"
              >
                <div className="relative">
                  {product.images?.[0]?.image_url ? (
                    <img
                      src={product.images[0].image_url}
                      alt={product.title}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
                      <Package size={32} className="text-gray-400" />
                    </div>
                  )}
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                  >
                    <Heart size={14} className="fill-red-500 text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                    <MapPin size={10} /> {product.area}, {product.city}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
