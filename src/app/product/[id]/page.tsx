'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, MapPin, Shield, Share2, Heart, MessageCircle, ChevronRight, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { ProductGallery } from '@/components/product/ProductGallery';
import { BookingPanel } from '@/components/product/BookingPanel';
import { ProductCard } from '@/components/product/ProductCard';
import { AuthModal } from '@/components/auth/AuthModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatINR, formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [authOpen, setAuthOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          owner:profiles(id, full_name, avatar_url, city)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setProduct(data);

      const { data: similarData } = await supabase
        .from('products')
        .select('*, category:categories(*), images:product_images(*), owner:profiles(*)')
        .eq('category_id', data.category_id)
        .neq('id', data.id)
        .limit(4);
        
      if (similarData) setSimilar(similarData);
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!product) notFound();

  const mockReviews = [
    {
      id: '1',
      reviewer: { full_name: 'Priya R.', avatar_url: 'https://i.pravatar.cc/60?img=5' },
      rating: 5,
      comment: 'Excellent condition! The owner was very professional and helpful. Highly recommend!',
      created_at: '2024-03-01',
    },
    {
      id: '2',
      reviewer: { full_name: 'Arun K.', avatar_url: 'https://i.pravatar.cc/60?img=15' },
      rating: 5,
      comment: 'Perfect for my event. Saved a lot of money compared to buying. Will rent again!',
      created_at: '2024-02-20',
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16 pb-24 md:pb-8">
        <div className="container-main py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <a href="/" className="hover:text-blue-600">Home</a>
            <ChevronRight size={12} />
            <a href="/browse" className="hover:text-blue-600">Browse</a>
            <ChevronRight size={12} />
            <a href={`/browse?category=${product.category?.slug}`} className="hover:text-blue-600">
              {product.category?.name}
            </a>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.title}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* Left column */}
            <div>
              {/* Gallery */}
              {product.images && product.images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ProductGallery images={product.images} title={product.title} />
                </motion.div>
              )}

              {/* Product info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-8 space-y-6"
              >
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    {product.category?.icon} {product.category?.name}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-0 rounded-full">
                    <Shield size={10} className="mr-1" /> Verified Asset
                  </Badge>
                  {product.is_featured && (
                    <Badge className="bg-blue-100 text-blue-700 border-0 rounded-full">
                      ⭐ Featured
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-3">
                    {product.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {product.rating && (
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{product.rating}</span>
                        <span className="text-gray-400">({product.review_count} reviews)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin size={14} />
                      {product.area}, {product.city}
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                      <button className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors">
                        <Share2 size={14} /> Share
                      </button>
                      <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                        <Heart size={14} /> Save
                      </button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                <Separator />

                {/* Owner card */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">About the Owner</h2>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                    <Avatar className="h-14 w-14 border-2 border-white shadow">
                      <AvatarImage src={product.owner?.avatar_url} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-bold">
                        {product.owner?.full_name?.charAt(0) ?? 'O'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900">{product.owner?.full_name}</p>
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                          ✓ Verified
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">4.9</span>
                        <span className="text-sm text-gray-400">· 45 successful rentals</span>
                      </div>
                      <p className="text-sm text-gray-500">Member since 2022 · {product.city}</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-all flex-shrink-0">
                      <MessageCircle size={14} />
                      Message
                    </button>
                  </div>
                </div>

                <Separator />

                {/* Reviews */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">
                      Reviews ({product.review_count})
                    </h2>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-gray-900">{product.rating}</span>
                      <span className="text-gray-400 text-sm">/ 5.0</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={review.reviewer.avatar_url} />
                            <AvatarFallback>{review.reviewer.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-gray-900">
                                {review.reviewer.full_name}
                              </span>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: review.rating }).map((_, j) => (
                                  <Star key={j} size={10} className="fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Booking panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <BookingPanel
                product={product}
                onAuthRequired={() => setAuthOpen(true)}
              />
            </motion.div>
          </div>

          {/* Similar products */}
          {similar.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                Similar Products You Might Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {similar.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <MobileNav />
    </>
  );
}
