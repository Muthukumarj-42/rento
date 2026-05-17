'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Calendar,
  Heart,
  MessageCircle,
  User,
  LogOut,
  Bell,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const DASHBOARD_NAV = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Calendar, label: 'My Bookings', href: '/dashboard/bookings' },
  { icon: Heart, label: 'Saved Items', href: '/dashboard/favorites' },
  { icon: MessageCircle, label: 'Messages', href: '/dashboard/messages', badge: 2 },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications', badge: 3 },
  { icon: User, label: 'Profile & KYC', href: '/dashboard/profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
      {/* Back to Browse */}
      <div className="px-4 pt-4 pb-2">
        <Link
          href="/browse"
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 font-medium transition-colors group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Back to Browse
        </Link>
      </div>

      {/* User info */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-blue-100">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
              {user?.full_name?.charAt(0) ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900 truncate">{user?.full_name ?? 'User'}</p>
            <Badge className="bg-blue-100 text-blue-700 border-0 text-xs mt-0.5">Customer</Badge>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3">
        <div className="space-y-0.5">
          {DASHBOARD_NAV.map((item) => {
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
                <span className="flex-1">{item.label}</span>
                {item.badge && !active && (
                  <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-14">
        <span className="font-black text-blue-600">Rento</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex min-h-screen pt-14 md:pt-0">
        {/* Desktop sidebar */}
        <div className="hidden md:flex flex-col sticky top-0 h-screen">
          <div className="h-16" /> {/* Navbar height offset */}
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
