'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowRight, User as UserIcon, Store, MapPin, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { type UserRole } from '@/types';
import { INDIAN_CITIES } from '@/lib/data';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().length(10, 'Must be a 10-digit number').regex(/^\d+$/, 'Must contain only numbers'),
  city: z.string().min(1, 'Please select your city'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [savedData, setSavedData] = useState<ProfileFormData | null>(null);

  const router = useRouter();
  const { setRole, setUser } = useAuthStore();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile?.onboarding_completed) {
        router.push(profile.role === 'owner' ? '/owner' : '/browse');
        return;
      }

      // Pre-fill from Google data
      if (profile?.full_name) setValue('full_name', profile.full_name);
      if (profile?.phone) setValue('phone', profile.phone);
      if (profile?.city) setValue('city', profile.city);

      setInitializing(false);
    };

    fetchUser();
  }, [router, setValue]);

  // Step 1 → Step 2: validate and advance
  const onStep1Submit = (data: ProfileFormData) => {
    setSavedData(data);
    setStep(2);
  };

  // Final submit
  const handleComplete = async () => {
    if (!selectedRole || !savedData) {
      toast.error('Please select a role to continue.');
      return;
    }
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id, // Need to include id for upsert
        email: user.email,
        full_name: savedData.full_name,
        phone: savedData.phone,
        city: savedData.city,
        role: selectedRole,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Profile update error:', error);
      toast.error(`Failed to save profile: ${error.message || 'Please try again.'}`);
      setLoading(false);
      return;
    }

    // Refresh state
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (updatedProfile) {
      setRole(updatedProfile.role as UserRole);
      setUser(updatedProfile as any);
    }

    toast.success(`Welcome to Rento! 🎉`);
    router.push(selectedRole === 'owner' ? '/owner' : '/browse');
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-100/80 py-4 px-6 fixed top-0 w-full z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-2xl font-black text-blue-600 tracking-tight">Rento</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 mr-2">Step {step} of 2</span>
            {[1, 2].map(s => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-500 ${
                  s <= step ? 'w-16 bg-blue-600' : 'w-8 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 pt-28">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {/* STEP 1: Profile Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 mb-4">
                    <UserIcon size={32} />
                  </div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Complete your profile</h1>
                  <p className="text-gray-500 mt-2 text-lg">Just a few details to get you started.</p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-5">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">Full Name *</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          {...register('full_name')}
                          placeholder="e.g. Karthik Rajan"
                          className="pl-11 h-13 rounded-2xl bg-gray-50 border-gray-200 text-gray-900 text-base focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                      </div>
                      {errors.full_name && (
                        <p className="text-red-500 text-xs mt-1.5">{errors.full_name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">Phone Number *</Label>
                      <div className="flex gap-3">
                        <div className="flex items-center justify-center px-4 h-13 bg-gray-50 border border-gray-200 rounded-2xl text-gray-600 text-sm font-semibold whitespace-nowrap">
                          🇮🇳 +91
                        </div>
                        <div className="relative flex-1">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <Input
                            {...register('phone')}
                            placeholder="9876543210"
                            maxLength={10}
                            inputMode="numeric"
                            className="pl-11 h-13 rounded-2xl bg-gray-50 border-gray-200 text-gray-900 text-base focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          />
                        </div>
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1.5">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">City *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                        <select
                          {...register('city')}
                          className="w-full pl-11 pr-4 h-13 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none cursor-pointer"
                        >
                          <option value="">Select your city</option>
                          {INDIAN_CITIES.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1.5">{errors.city.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-2xl text-base font-bold shadow-md hover:shadow-lg transition-all mt-2"
                    >
                      Continue <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Role Selection */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">How will you use Rento?</h1>
                  <p className="text-gray-500 mt-2 text-lg">You can switch roles anytime from your profile.</p>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Customer card */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedRole('customer')}
                    className={`w-full p-6 rounded-3xl border-2 text-left transition-all duration-200 ${
                      selectedRole === 'customer'
                        ? 'border-blue-600 bg-blue-50/80 shadow-lg shadow-blue-100'
                        : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-all ${
                        selectedRole === 'customer' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'
                      }`}>
                        🛒
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-xl text-gray-900">I want to Rent</h3>
                          {selectedRole === 'customer' && (
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-500 mt-1.5 leading-relaxed">
                          Browse and rent cameras, bikes, tools, and more from trusted local owners.
                        </p>
                        <div className="flex gap-2 mt-3">
                          {['🎬 Cameras', '🚲 Bikes', '🔧 Tools'].map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  {/* Owner card */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedRole('owner')}
                    className={`w-full p-6 rounded-3xl border-2 text-left transition-all duration-200 ${
                      selectedRole === 'owner'
                        ? 'border-blue-600 bg-blue-50/80 shadow-lg shadow-blue-100'
                        : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-all ${
                        selectedRole === 'owner' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'
                      }`}>
                        🏪
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-xl text-gray-900">I want to Earn</h3>
                          {selectedRole === 'owner' && (
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-500 mt-1.5 leading-relaxed">
                          List your idle items and earn ₹15K–₹80K/month renting them to verified renters.
                        </p>
                        <div className="flex gap-2 mt-3">
                          {['💰 Earn money', '📦 Easy listing', '🛡️ Insured'].map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="h-14 px-6 rounded-2xl font-semibold border-gray-200 hover:bg-gray-50 text-gray-700"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-2xl text-base font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedRole || loading}
                    onClick={handleComplete}
                  >
                    {loading ? (
                      <><Loader2 className="animate-spin mr-2" size={20} /> Setting up your account...</>
                    ) : (
                      'Get Started 🚀'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
