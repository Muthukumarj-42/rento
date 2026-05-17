'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Package, Calendar, CreditCard, AlertTriangle, BarChart2, LogOut, Menu, X, Shield,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: 'Overview', href: '/admin', badge: null },
  { icon: Users, label: 'Users', href: '/admin/users', badge: null },
  { icon: Package, label: 'Listings', href: '/admin/listings', badge: 7 },
  { icon: Calendar, label: 'Bookings', href: '/admin/bookings', badge: null },
  { icon: CreditCard, label: 'Payments', href: '/admin/payments', badge: null },
  { icon: AlertTriangle, label: 'Disputes', href: '/admin/disputes', badge: 2 },
  { icon: BarChart2, label: 'Analytics', href: '/admin/analytics', badge: null },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { signOut } = useAuthStore();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
    window.location.href = '/';
  };

  const Sidebar = () => (
    <aside className="w-60 flex-shrink-0 bg-gray-950 flex flex-col">
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-blue-400" />
          <div>
            <span className="text-lg font-black text-white">Rento</span>
            <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {ADMIN_NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={17} />
              <span className="flex-1">{item.label}</span>
              {item.badge && !active && (
                <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-950 flex items-center justify-between px-4 h-14">
        <span className="font-black text-blue-400">Rento Admin</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-white">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/70" onClick={() => setSidebarOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-60" onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex min-h-screen pt-14 md:pt-0">
        <div className="hidden md:flex flex-col sticky top-0 h-screen">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
