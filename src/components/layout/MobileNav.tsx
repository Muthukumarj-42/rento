'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const TABS = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Search, label: 'Browse', href: '/browse' },
  { icon: Heart, label: 'Saved', href: '/dashboard/favorites' },
  { icon: MessageCircle, label: 'Messages', href: '/dashboard/messages' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-100 safe-area-bottom">
      <div className="flex items-stretch h-16">
        {TABS.map((tab) => {
          const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            >
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon
                size={20}
                className={cn(
                  'transition-colors',
                  active ? 'text-blue-600' : 'text-gray-400'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  active ? 'text-blue-600' : 'text-gray-400'
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
