'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, ShieldAlert, Phone, MapPin, Loader2, Camera, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function CustomerProfilePage() {
  const { user, setUser } = useAuthStore();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    full_name: '', phone: '', city: '', bio: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setLoading(false); return; }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { toast.error('Not authenticated'); setSaving(false); return; }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        city: profile.city,
        bio: profile.bio,
      })
      .eq('id', authUser.id);

    if (error) {
      toast.error(`Failed to save: ${error.message}`);
    } else {
      setUser({ ...user, full_name: profile.full_name });
      toast.success('Profile updated! ✅');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-gray-900">Profile & KYC</h1>
        <p className="text-gray-500 mt-1">Manage your personal details and verification</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left — Avatar & Status */}
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center"
          >
            <div className="relative inline-block mb-4">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg mx-auto">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow cursor-pointer">
                <Camera size={12} className="text-white" />
              </div>
            </div>
            <h2 className="font-bold text-gray-900">{profile?.full_name || 'Your Name'}</h2>
            <p className="text-xs text-gray-500 mb-2">{profile?.email}</p>
            <Badge className="bg-blue-100 text-blue-700 border-0">Customer</Badge>
          </motion.div>

          {/* KYC Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
          >
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-600" /> Verification
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Email</span>
                <span className="text-green-600 font-semibold flex items-center gap-1 text-xs">
                  <ShieldCheck size={12} /> Verified
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Phone</span>
                <span className={`font-semibold text-xs ${profile?.phone ? 'text-green-600' : 'text-amber-600'}`}>
                  {profile?.phone ? '✓ Added' : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">KYC</span>
                <span className="text-amber-600 font-semibold text-xs flex items-center gap-1">
                  <ShieldAlert size={12} /> Pending
                </span>
              </div>
            </div>

            <div className="mt-5 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs text-amber-700 font-medium mb-2">Complete KYC to unlock higher booking limits and priority support.</p>
              <Button size="sm" variant="outline" className="w-full h-8 text-xs rounded-lg border-amber-200 text-amber-700 hover:bg-amber-100">
                <Upload size={12} className="mr-1.5" /> Upload Documents
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Right — Edit Form */}
        <div className="md:col-span-2">
          <motion.form
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            onSubmit={handleSave}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <User size={20} className="text-blue-600" />
              <h3 className="font-bold text-gray-900">Personal Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full Name</Label>
                <Input
                  value={profile?.full_name || ''}
                  onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  <Phone size={13} className="inline mr-1" /> Phone Number
                </Label>
                <Input
                  value={profile?.phone || ''}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  <MapPin size={13} className="inline mr-1" /> City
                </Label>
                <Input
                  value={profile?.city || ''}
                  onChange={e => setProfile({ ...profile, city: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="e.g. Coimbatore"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Bio</Label>
                <Input
                  value={profile?.bio || ''}
                  onChange={e => setProfile({ ...profile, bio: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 font-bold" disabled={saving}>
                {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                Save Changes
              </Button>
            </div>
          </motion.form>

          {/* Rental Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-5"
          >
            <h3 className="font-bold text-gray-900 mb-4">Account Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).getFullYear().toString() : '—' },
                { label: 'Role', value: 'Customer' },
                { label: 'Status', value: 'Active' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
