'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter, Grid, List, SlidersHorizontal, X, Search, MapPin, ChevronDown } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CATEGORIES, INDIAN_CITIES } from '@/lib/data';
import { type SearchFilters } from '@/types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    city: 'Coimbatore',
    category: '',
    sortBy: 'newest',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hydration-safe: only run client-side
  useEffect(() => {
    setMounted(true);
    setFilters({
      query: searchParams.get('q') || '',
      city: searchParams.get('city') || 'Coimbatore',
      category: searchParams.get('category') || '',
      sortBy: 'newest',
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (image_url, order),
          category:categories (*),
          owner:profiles (id, full_name, avatar_url, city)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (data) {
        const formatted = data.map(p => ({
          ...p,
          images: (p.product_images || [])
            .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
            .map((img: any) => ({ image_url: img.image_url })),
          category: p.category,
          owner: p.owner
        }));
        setProducts(formatted);
      }
      setLoading(false);
    };
    
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    let results = [...products];
    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      );
    }
    if (filters.category) {
      results = results.filter((p) => p.category?.slug === filters.category);
    }
    if (filters.city) {
      results = results.filter((p) => p.city === filters.city);
    }
    results = results.filter(
      (p) => p.price_per_day >= priceRange[0] && p.price_per_day <= priceRange[1]
    );
    if (minRating > 0) {
      results = results.filter((p) => (p.rating || 0) >= minRating);
    }
    switch (filters.sortBy) {
      case 'price_asc':
        results.sort((a, b) => a.price_per_day - b.price_per_day);
        break;
      case 'price_desc':
        results.sort((a, b) => b.price_per_day - a.price_per_day);
        break;
      case 'rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }
    return results;
  }, [filters, priceRange, minRating]);

  const activeFilterCount = [
    filters.category,
    minRating > 0,
    priceRange[0] > 0 || priceRange[1] < 10000,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        {/* Filter bar */}
        <div className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm">
          <div className="container-main py-3">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              {/* Search */}
              <div className="relative flex-shrink-0 flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rentals..."
                  value={filters.query}
                  onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
                  suppressHydrationWarning
                />
              </div>

              {/* Filters toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-shrink-0 gap-1.5 rounded-xl relative ${showFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : ''}`}
                suppressHydrationWarning
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              {/* City */}
              <select
                value={filters.city}
                onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                className="flex-shrink-0 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-400"
                suppressHydrationWarning
              >
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Category chips */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setFilters((f) => ({ ...f, category: '' }))}
                  className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-full border transition-all ${
                    !filters.category ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilters((f) => ({ ...f, category: f.category === cat.slug ? '' : cat.slug }))}
                    className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-full border transition-all flex items-center gap-1.5 ${
                      filters.category === cat.slug
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as SearchFilters['sortBy'] }))}
                className="flex-shrink-0 ml-auto px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* View mode */}
              <div className="flex-shrink-0 flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List size={14} />
                </button>
              </div>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 pb-1 border-t border-gray-100 mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {/* Price range */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Price Range (₹/day)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0] || ''}
                      onChange={(e) => setPriceRange([+e.target.value || 0, priceRange[1]])}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
                    />
                    <span className="text-gray-400">–</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1] === 10000 ? '' : priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], +e.target.value || 10000])}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Minimum Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[0, 3, 4, 4.5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setMinRating(r)}
                        className={`px-3 py-1.5 text-sm rounded-xl border transition-all ${
                          minRating === r ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {r === 0 ? 'Any' : `${r}★+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset */}
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilters({ query: '', city: 'Coimbatore', sortBy: 'newest' });
                      setPriceRange([0, 10000]);
                      setMinRating(0);
                    }}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X size={14} /> Clear All Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="container-main py-6 pb-24 md:pb-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">
              Showing <strong className="text-gray-900">{filtered.length}</strong> rentals
              {filters.city && <> in <strong className="text-gray-900">{filters.city}</strong></>}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search in a different city.</p>
              <Button
                onClick={() => {
                  setFilters({ city: 'Coimbatore', sortBy: 'newest' });
                  setPriceRange([0, 10000]);
                  setMinRating(0);
                }}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={`grid gap-5 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2'
            }`}>
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>}>
      <BrowseContent />
    </Suspense>
  );
}
