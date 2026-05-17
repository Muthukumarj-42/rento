'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, User as UserIcon, Store, LogOut, Loader2, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function OwnerProfilePage() {
  const { user, signOut, setRole } = useAuthStore();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data } = await supabase
        .from('profiles')
        .select('*, owner_profiles(*)')
        .eq('id', authUser.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        city: profile.city,
      })
      .eq('id', profile.id);

    // Upsert owner_profiles
    const { error: ownerError } = await supabase
      .from('owner_profiles')
      .upsert({
        user_id: profile.id,
        shop_name: profile.owner_profiles?.[0]?.shop_name || profile.full_name + ' Shop',
        bio: profile.owner_profiles?.[0]?.bio || '',
      });

    if (profileError || ownerError) {
      toast.error('Failed to save profile updates.');
    } else {
      toast.success('Profile updated successfully!');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Owner Profile</h1>
        <p className="text-gray-500 mt-1">Manage your business details and settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column - Verification & Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white shadow-lg">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                {profile?.full_name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-gray-900">{profile?.full_name}</h2>
            <p className="text-sm text-gray-500 mb-3">{profile?.email}</p>
            <Badge className="bg-purple-100 text-purple-700 font-bold border-0">Premium Owner</Badge>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="text-green-500" size={20} />
              Verification Status
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Email Address</span>
                <span className="text-green-600 font-semibold flex items-center gap-1"><ShieldCheck size={14}/> Verified</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Phone Number</span>
                <span className="text-green-600 font-semibold flex items-center gap-1"><ShieldCheck size={14}/> Verified</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">KYC Status</span>
                <span className="text-amber-600 font-semibold flex items-center gap-1">Pending</span>
              </div>
              
              <Button variant="outline" className="w-full mt-4 text-xs h-9 rounded-xl border-dashed">
                Complete KYC Verification
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Edit Details */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <UserIcon className="text-blue-600" size={24} />
              <h3 className="text-lg font-bold text-gray-900">Personal Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full Name</Label>
                <Input 
                  value={profile?.full_name || ''} 
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone Number</Label>
                <Input 
                  value={profile?.phone || ''} 
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">City / Location</Label>
                <Input 
                  value={profile?.city || ''} 
                  onChange={(e) => setProfile({...profile, city: e.target.value})}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 pt-4">
              <Store className="text-blue-600" size={24} />
              <h3 className="text-lg font-bold text-gray-900">Business Details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Store/Business Name</Label>
                <Input 
                  value={profile?.owner_profiles?.[0]?.shop_name || ''} 
                  onChange={(e) => setProfile({
                    ...profile, 
                    owner_profiles: [{ ...(profile.owner_profiles?.[0] || {}), shop_name: e.target.value }]
                  })}
                  className="h-11 rounded-xl"
                  placeholder="e.g. Karthik Rentals"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">About the Business</Label>
                <textarea 
                  value={profile?.owner_profiles?.[0]?.bio || ''} 
                  onChange={(e) => setProfile({
                    ...profile, 
                    owner_profiles: [{ ...(profile.owner_profiles?.[0] || {}), bio: e.target.value }]
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
                  placeholder="Describe your equipment and policies..."
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 font-bold" disabled={saving}>
                {saving ? <Loader2 className="animate-spin mr-2" size={16}/> : null}
                Save Changes
              </Button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
            <h3 className="font-bold text-red-900 mb-2">Account Actions</h3>
            <p className="text-sm text-red-700 mb-4">You can switch back to customer mode or sign out of your account here.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="bg-white border-red-200 text-red-700 hover:bg-red-100 rounded-xl">
                Switch to Customer
              </Button>
              <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2 font-bold">
                <LogOut size={16} /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
