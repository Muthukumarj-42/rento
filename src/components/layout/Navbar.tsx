'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Menu, X, Bell, ChevronDown, MapPin,
  LayoutDashboard, Heart, Settings, LogOut, RefreshCw, User as UserIcon,
  Package, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { type UserRole } from '@/types';
import { toast } from 'sonner';

const GUEST_LINKS = [
  { label: 'Browse', href: '/browse' },
  { label: 'Categories', href: '/browse?view=categories' },
];

const CUSTOMER_LINKS = [
  { label: 'Browse', href: '/browse' },
  { label: 'Categories', href: '/browse?view=categories' },
  { label: 'Saved', href: '/dashboard/favorites' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, signOut, setUser, setRole } = useAuthStore();
  const supabase = createClient();

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync auth state from Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setUser(profile as any);
          setRole(profile.role as UserRole);
        }
      } else {
        signOut();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
    toast.success('Signed out successfully');
    router.push('/');
  };

  const handleSwitchRole = async (newRole: UserRole) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id);
    if (!error) {
      setRole(newRole);
      setUser({ ...user, role: newRole });
      toast.success(`Switched to ${newRole} mode`);
      router.push(newRole === 'owner' ? '/owner' : '/browse');
    }
  };

  const isHomePage = pathname === '/';
  const isTransparent = isHomePage && !scrolled;
  const navLinks = user ? (role === 'owner' ? [] : CUSTOMER_LINKS) : GUEST_LINKS;

  // Don't show Navbar inside owner dashboard (it has its own sidebar)
  if (pathname.startsWith('/owner')) return null;

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isTransparent
            ? 'bg-transparent'
            : 'bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm'
        )}
      >
        <div className="container-main">
          <div className="flex h-16 items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
                <span className="text-white font-black text-sm">R</span>
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">Rento</span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                    pathname === link.href
                      ? 'text-blue-600 bg-blue-50'
                      : isTransparent
                        ? 'text-white/90 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Search bar — desktop, only for customers/guests */}
            {role !== 'owner' && (
              <Link
                href="/browse"
                className={cn(
                  'hidden lg:flex items-center gap-3 px-5 py-2.5 rounded-2xl border text-sm transition-all duration-200 min-w-[260px] group',
                  isTransparent
                    ? 'bg-white/20 border-white/30 text-white/80 hover:bg-white/30 backdrop-blur-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50/50'
                )}
              >
                <Search size={15} className="flex-shrink-0 group-hover:text-blue-500 transition-colors" />
                <span className="flex-1">Search anything...</span>
                <span className="flex items-center gap-1 text-xs opacity-70">
                  <MapPin size={11} /> CBE
                </span>
              </Link>
            )}

            {/* Right: Auth / User */}
            <div className="flex items-center gap-2.5">
              {user ? (
                <>
                  {/* Notifications bell */}
                  <Link
                    href="/dashboard/notifications"
                    className={cn(
                      'relative inline-flex items-center justify-center h-10 w-10 rounded-xl transition-colors',
                      isTransparent
                        ? 'text-white/90 hover:bg-white/20'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <Bell size={19} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
                  </Link>

                  {/* Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        'flex items-center gap-2.5 px-2 pr-3 py-1.5 rounded-2xl border transition-all outline-none',
                        isTransparent
                          ? 'border-white/30 hover:bg-white/20 text-white'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                        <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="text-xs bg-blue-600 text-white font-bold">
                            {user.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className={cn(
                          'text-sm font-semibold hidden sm:block max-w-[100px] truncate',
                          isTransparent ? 'text-white' : 'text-gray-800'
                        )}>
                          {user.full_name?.split(' ')[0]}
                        </span>
                        <ChevronDown size={15} className={isTransparent ? 'text-white/70' : 'text-gray-400'} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 mt-2 rounded-2xl border border-gray-100 bg-white shadow-xl p-1.5 z-50">
                      {/* User info */}
                      <div className="px-3 py-3 border-b border-gray-100 mb-1">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="bg-blue-600 text-white font-bold">
                              {user.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            <span className={cn(
                              'inline-block text-xs px-2 py-0.5 rounded-full font-semibold mt-0.5',
                              role === 'owner'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            )}>
                              {role === 'owner' ? '🏪 Owner' : '🛒 Customer'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {role === 'owner' ? (
                        <>
                          <DropdownMenuItem className="rounded-xl gap-3 py-2.5 cursor-pointer" onClick={() => router.push('/owner')}>
                            <LayoutDashboard size={16} className="text-gray-500" /> Owner Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl gap-3 py-2.5 cursor-pointer" onClick={() => router.push('/owner/listings')}>
                            <Package size={16} className="text-gray-500" /> My Listings
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl gap-3 py-2.5 cursor-pointer" onClick={() => router.push('/owner/profile')}>
                            <Settings size={16} className="text-gray-500" /> Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl gap-3 py-2.5 cursor-pointer" onClick={() => router.push('/owner/profile')}>
                            <UserIcon size={16} className="text-gray-500" /> View Profile
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem className="rounded-xl gap-3 py-2.5 cursor-pointer" onClick={() => router.push('/dashboard')}>
                            <LayoutDashboard size={16} className="text-gray-500" /> Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl gap-3 py-2.5 cursor-pointer" onClick={() => router.push('/dashboard/bookings')}>
                            <Calendar size={16} className="text-gray-500" /> My Bookings
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl gap-3 py-2.5 cursor-pointer" onClick={() => router.push('/dashboard/favorites')}>
                            <Heart size={16} className="text-gray-500" /> Saved Items
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl gap-3 py-2.5 cursor-pointer" onClick={() => router.push('/dashboard/notifications')}>
                            <Bell size={16} className="text-gray-500" /> Notifications
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl gap-3 py-2.5 cursor-pointer" onClick={() => router.push('/profile')}>
                            <UserIcon size={16} className="text-gray-500" /> Profile
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator className="my-1" />

                      {/* Switch role */}
                      <DropdownMenuItem
                        className="rounded-xl gap-3 py-2.5 cursor-pointer text-indigo-600"
                        onClick={() => handleSwitchRole(role === 'owner' ? 'customer' : 'owner')}
                      >
                        <RefreshCw size={16} />
                        Switch to {role === 'owner' ? 'Customer' : 'Owner'} Mode
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="my-1" />

                      <DropdownMenuItem
                        className="rounded-xl gap-3 py-2.5 cursor-pointer text-red-600 hover:!bg-red-50"
                        onClick={handleSignOut}
                      >
                        <LogOut size={16} /> Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className={cn(
                      'hidden sm:flex h-11 px-5 rounded-xl font-semibold text-sm',
                      isTransparent ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:bg-gray-50'
                    )}
                    onClick={() => setAuthOpen(true)}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    onClick={() => setAuthOpen(true)}
                  >
                    Get Started
                  </Button>
                </>
              )}

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'md:hidden h-10 w-10 rounded-xl',
                  isTransparent ? 'text-white hover:bg-white/20' : 'text-gray-700'
                )}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden border-t border-gray-100 bg-white shadow-lg"
            >
              <div className="container-main py-4 flex flex-col gap-1">
                <Link
                  href="/browse"
                  className="flex items-center gap-3 p-3.5 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  <Search size={18} className="text-gray-400" />
                  Search rentals
                </Link>

                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="p-3.5 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {user ? (
                  <>
                    <Link href="/profile" className="p-3.5 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold" onClick={() => setMobileOpen(false)}>
                      My Profile
                    </Link>
                    <button
                      onClick={() => { handleSignOut(); setMobileOpen(false); }}
                      className="p-3.5 rounded-xl text-red-600 hover:bg-red-50 font-semibold text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Button
                    className="mt-2 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                    onClick={() => { setAuthOpen(true); setMobileOpen(false); }}
                  >
                    Sign In / Get Started
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
