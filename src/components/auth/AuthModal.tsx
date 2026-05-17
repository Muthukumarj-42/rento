'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message === 'Unsupported provider: provider is not enabled'
        ? 'Google Sign-In is not enabled in Supabase.'
        : 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mx-4">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
                <div>
                  <span className="text-2xl font-black text-blue-600 tracking-tight">Rento</span>
                  <p className="text-sm text-gray-500 mt-1 font-medium">
                    Welcome to the marketplace
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6 text-center"
                >
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 mb-6">
                    <div className="text-4xl mb-2">👋</div>
                    <h3 className="font-bold text-gray-900">Get Started Now</h3>
                    <p className="text-xs text-gray-500 mt-1">Join thousands of users renting locally</p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-14 text-base font-semibold border-gray-200 hover:border-gray-300 hover:bg-gray-50 gap-3 rounded-2xl shadow-sm transition-all hover:shadow"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin text-blue-600" />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    Continue with Google
                  </Button>

                  <p className="text-xs text-gray-400 mt-6 pt-6 border-t border-gray-100">
                    By continuing, you agree to Rento&apos;s{' '}
                    <a href="/terms" className="text-blue-600 hover:underline font-medium">Terms</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
