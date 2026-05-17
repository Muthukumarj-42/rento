'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3, Package, Calendar, TrendingUp, LogOut, Menu, X, Plus, Zap,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const OWNER_NAV = [
  { icon: BarChart3, label: 'Analytics', href: '/owner' },
  { icon: TrendingUp, label: 'Earnings', href: '/owner/earnings' },
  { icon: Package, label: 'My Listings', href: '/owner/listings' },
  { icon: Calendar, label: 'Bookings', href: '/owner/bookings' },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuthStore();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
    window.location.href = '/';
  };

  const Sidebar = () => (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
      <div className="p-5 border-b border-gray-100">
        <span className="text-xl font-black text-blue-600">Rento</span>
        <p className="text-xs text-gray-400 mt-0.5 font-medium">Vendor Hub</p>
      </div>

      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-sm">
              {user?.full_name?.charAt(0) ?? 'O'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-bold text-xs text-gray-900 truncate">{user?.full_name ?? 'Owner'}</p>
            <Badge className="bg-purple-100 text-purple-700 border-0 text-xs mt-0.5">PREMIUM PARTNER</Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {OWNER_NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4">
          <Link
            href="/owner/listings/new"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <Plus size={17} /> List New Product
          </Link>
        </div>
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </aside>
  );

  const TopNavbar = () => (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-gray-600">
          <Menu size={20} />
        </button>
        <div className="hidden md:block">
          <span className="text-xl font-black text-blue-600 tracking-tight">Rento Vendor</span>
        </div>
      </div>
      
      {/* Right side actions */}
      <div className="flex items-center gap-3 md:gap-5">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
          <TrendingUp size={14} className="text-green-600" />
          <span className="text-xs font-bold text-green-700">₹12,450 Earned</span>
        </div>
        
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Zap size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
            <Avatar className="h-8 w-8 ring-2 ring-blue-100">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                {user?.full_name?.charAt(0) ?? 'O'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-gray-900">{user?.full_name?.split(' ')[0]}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl border border-gray-100 bg-white shadow-xl p-1.5 z-50">
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <p className="text-sm font-bold text-gray-900">{user?.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <DropdownMenuItem className="rounded-xl cursor-pointer py-2" onClick={() => window.location.href = '/owner/profile'}>
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl cursor-pointer py-2" onClick={() => window.location.href = '/owner/listings'}>
              My Listings
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl cursor-pointer py-2" onClick={() => window.location.href = '/owner/profile'}>
              Settings
            </DropdownMenuItem>
            <div className="h-px bg-gray-100 my-1 mx-2" />
            <DropdownMenuItem className="rounded-xl cursor-pointer py-2 text-blue-600 font-medium" onClick={() => window.location.href = '/browse'}>
              Switch to Customer
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl cursor-pointer py-2 text-red-600 font-medium" onClick={handleSignOut}>
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 sticky top-0 h-screen shadow-sm z-40">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
