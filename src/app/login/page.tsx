'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthModal } from '@/components/auth/AuthModal';

export default function LoginPage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-black text-blue-600 mb-2">Rento</h1>
        <p className="text-gray-500 text-sm">Sign in to continue</p>
      </motion.div>
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
