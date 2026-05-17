'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, ArrowRight, Star } from 'lucide-react';
import { INDIAN_CITIES } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const HERO_STATS = [
  { value: '2,400+', label: 'Products Listed' },
  { value: '1,200+', label: 'Happy Renters' },
  { value: '4.9★', label: 'Avg. Rating' },
];

const QUICK_SEARCHES = [
  'Camera', 'Drone', 'Bike', 'Power Tools', 'PA System', 'Projector',
];

export function HeroSection() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Coimbatore');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (city) params.set('city', city);
    router.push(`/browse?${params.toString()}`);
  };

  const handleQuickSearch = (term: string) => {
    router.push(`/browse?q=${encodeURIComponent(term)}&city=${city}`);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/30 rounded-full blur-3xl" />
        <div className="absolute top-20 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-700" />
      </div>

      <div className="container-main relative w-full pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700 mb-6"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Now in Coimbatore · Expanding across Tamil Nadu
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-6"
            >
              Rent{' '}
              <span className="gradient-text">Anything</span>
              <br />
              Nearby
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md"
            >
              Access high-end creator gear, power tools, luxury vehicles, and essentials directly from your local community. Professional grade assets, fraction of the cost.
            </motion.p>

            {/* Search bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-white rounded-2xl shadow-xl border border-gray-100 mb-4 max-w-lg"
            >
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="What do you need?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 text-sm outline-none text-gray-800 placeholder:text-gray-400 bg-transparent py-2"
                />
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-200" />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap outline-none">
                  <MapPin size={14} className="text-blue-500" />
                  {city}
                  <ChevronDown size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
                  {INDIAN_CITIES.map((c) => (
                    <DropdownMenuItem key={c} onClick={() => setCity(c)}>
                      {c}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Search
              </button>
            </motion.form>

            {/* Quick searches */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 mb-10"
            >
              <span className="text-xs text-gray-400 pt-1">Popular:</span>
              {QUICK_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handleQuickSearch(term)}
                  className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  {term}
                </button>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-6"
            >
              {HERO_STATS.map((stat, i) => (
                <div key={i}>
                  <div className="text-xl font-black text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Product cards visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative hidden lg:block"
          >
            {/* Floating product cards */}
            <div className="relative h-[500px]">
              {/* Main card */}
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-8 right-0 w-64 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
              >
                <img
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80"
                  alt="Sony Camera"
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold text-gray-700">4.9</span>
                    <span className="text-xs text-gray-400">(47)</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Sony Alpha A7S III</p>
                  <p className="text-xs text-gray-500 mt-0.5">RS Puram, Coimbatore</p>
                  <p className="text-blue-600 font-black text-lg mt-2">₹2,500<span className="text-xs font-normal text-gray-400">/day</span></p>
                </div>
              </motion.div>

              {/* Secondary card */}
              <motion.div
                animate={{ y: [4, -4, 4] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-16 left-0 w-52 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
              >
                <img
                  src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&q=80"
                  alt="Drone"
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-900">DJI Mavic 3 Pro</p>
                  <p className="text-blue-600 font-bold mt-1">₹3,500<span className="text-xs font-normal text-gray-400">/day</span></p>
                </div>
              </motion.div>

              {/* Badge floating */}
              <motion.div
                animate={{ y: [-6, 2, -6] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-1/2 left-1/4 bg-white rounded-xl shadow-lg px-3 py-2 border border-gray-100"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Just booked in CBE
                </div>
              </motion.div>

              {/* Third mini card */}
              <motion.div
                animate={{ y: [2, -4, 2] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="absolute bottom-4 right-8 w-44 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
              >
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"
                  alt="Bike"
                  className="w-full h-28 object-cover"
                />
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-900">Trek FX3 Bike</p>
                  <p className="text-blue-600 font-bold mt-1">₹399<span className="text-xs font-normal text-gray-400">/day</span></p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
