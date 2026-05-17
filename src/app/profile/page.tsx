'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, MapPin, Edit3, Save, X, Camera,
  Calendar, Shield, RefreshCw, LogOut, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/layout/Navbar';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { type UserRole } from '@/types';
import { INDIAN_CITIES } from '@/lib/data';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: '',
    bio: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user, setUser, setRole, signOut } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push('/login'); return; }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          city: data.city || '',
          bio: data.bio || '',
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to update profile.');
    } else {
      setProfile({ ...profile, ...formData });
      setUser({ ...user, ...formData } as any);
      toast.success('Profile updated!');
      setEditing(false);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB.');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${profile.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error('Upload failed. Make sure the "avatars" bucket exists in Supabase Storage.');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatar_url = urlData.publicUrl;

    await supabase.from('profiles').update({ avatar_url }).eq('id', profile.id);
    setProfile({ ...profile, avatar_url });
    setUser({ ...user, avatar_url } as any);
    toast.success('Avatar updated!');
    setUploading(false);
  };

  const handleSwitchRole = async (newRole: UserRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profile.id);

    if (!error) {
      setRole(newRole);
      setProfile({ ...profile, role: newRole });
      setUser({ ...user, role: newRole } as any);
      toast.success(`Switched to ${newRole} mode`);
      router.push(newRole === 'owner' ? '/owner' : '/browse');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const roleLabel = profile?.role === 'owner' ? '🏪 Owner' : '🛒 Customer';
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container-main max-w-3xl">

          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-black text-gray-900">My Profile</h1>
            <p className="text-gray-500 mt-1">Manage your personal details and account settings.</p>
          </motion.div>

          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6"
          >
            {/* Cover */}
            <div className="h-28 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />

            {/* Avatar + actions */}
            <div className="px-8 pb-6">
              <div className="flex items-end justify-between -mt-12 mb-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-blue-600 text-white text-3xl font-black">
                      {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {uploading
                      ? <Loader2 size={22} className="text-white animate-spin" />
                      : <Camera size={22} className="text-white" />
                    }
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>

                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button
                        variant="outline"
                        className="h-10 px-4 rounded-xl border-gray-200 font-semibold"
                        onClick={() => setEditing(false)}
                      >
                        <X size={16} className="mr-1" /> Cancel
                      </Button>
                      <Button
                        className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? <Loader2 size={16} className="animate-spin mr-1" /> : <Save size={16} className="mr-1" />}
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-10 px-5 rounded-xl border-gray-200 font-semibold hover:border-blue-300 hover:text-blue-600"
                      onClick={() => setEditing(true)}
                    >
                      <Edit3 size={16} className="mr-2" /> Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              {/* Name & meta */}
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900">{profile?.full_name || 'Your Name'}</h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className={cn(
                    'text-xs px-3 py-1 rounded-full font-bold',
                    profile?.role === 'owner'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  )}>
                    {roleLabel}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={12} /> Member since {memberSince}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                    <Shield size={12} /> Google Verified
                  </span>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Full Name
                  </Label>
                  {editing ? (
                    <Input
                      value={formData.full_name}
                      onChange={e => setFormData(d => ({ ...d, full_name: e.target.value }))}
                      className="rounded-xl bg-gray-50 border-gray-200 h-11"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <User size={16} className="text-gray-400" />
                      {profile?.full_name || '—'}
                    </div>
                  )}
                </div>

                {/* Email (non-editable) */}
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Email (Google)
                  </Label>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm">{profile?.email || '—'}</span>
                    <span className="text-xs text-gray-400">(not editable)</span>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Phone Number
                  </Label>
                  {editing ? (
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 font-medium whitespace-nowrap">+91</span>
                      <Input
                        value={formData.phone}
                        onChange={e => setFormData(d => ({ ...d, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                        className="rounded-xl bg-gray-50 border-gray-200 h-11"
                        placeholder="9876543210"
                        maxLength={10}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <Phone size={16} className="text-gray-400" />
                      {profile?.phone ? `+91 ${profile.phone}` : '—'}
                    </div>
                  )}
                </div>

                {/* City */}
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    City
                  </Label>
                  {editing ? (
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <select
                        value={formData.city}
                        onChange={e => setFormData(d => ({ ...d, city: e.target.value }))}
                        className="w-full pl-9 pr-4 h-11 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
                      >
                        <option value="">Select city</option>
                        {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <MapPin size={16} className="text-gray-400" />
                      {profile?.city || '—'}
                    </div>
                  )}
                </div>

                {/* Bio — full width */}
                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Bio / About
                  </Label>
                  {editing ? (
                    <textarea
                      value={formData.bio}
                      onChange={e => setFormData(d => ({ ...d, bio: e.target.value }))}
                      rows={3}
                      placeholder="Tell renters a bit about yourself..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {profile?.bio || <span className="text-gray-400 italic">No bio added yet.</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6"
          >
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Account</h3>
            <div className="space-y-3">
              {/* Switch Role */}
              <button
                onClick={() => handleSwitchRole(profile?.role === 'owner' ? 'customer' : 'owner')}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                    <RefreshCw size={18} className="text-indigo-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Switch to {profile?.role === 'owner' ? 'Customer' : 'Owner'} Mode</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {profile?.role === 'owner' ? 'Browse and rent items as a customer' : 'List your items and earn money'}
                    </p>
                  </div>
                </div>
                <span className="text-indigo-600 font-semibold text-sm">Switch</span>
              </button>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-red-200 hover:bg-red-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                    <LogOut size={18} className="text-red-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-600 text-sm">Sign Out</p>
                    <p className="text-xs text-gray-500 mt-0.5">You'll need to sign in again to access Rento</p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
