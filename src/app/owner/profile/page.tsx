'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, User as UserIcon, Store, LogOut, Loader2, Phone,
  MapPin, Clock, Truck, Info
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function OwnerProfilePage() {
  const { user, signOut } = useAuthStore();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    full_name: '',
    phone: '',
    city: '',
    bio: '',
    // Business fields stored in profile
    shop_name: '',
    pickup_address: '',
    support_phone: '',
    working_hours: '',
    gst_number: '',
    delivery_available: false,
    business_description: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data) {
        setProfile({
          ...data,
          shop_name: data.shop_name || '',
          pickup_address: data.pickup_address || '',
          support_phone: data.support_phone || data.phone || '',
          working_hours: data.working_hours || '9:00 AM – 7:00 PM',
          gst_number: data.gst_number || '',
          delivery_available: data.delivery_available || false,
          business_description: data.business_description || '',
        });
      }
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
      toast.success('Profile updated successfully! ✅');
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

        {/* Left Column - Avatar & Verification */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white shadow-lg">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
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
                <span className={profile?.phone ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>
                  {profile?.phone ? '✓ Verified' : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">KYC Status</span>
                <span className={`font-semibold ${profile?.kyc_status === 'verified' ? 'text-green-600' : 'text-amber-600'}`}>
                  {profile?.kyc_status === 'verified' ? '✓ Verified' : 'Pending'}
                </span>
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

            {/* Personal Details */}
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <UserIcon className="text-blue-600" size={24} />
              <h3 className="text-lg font-bold text-gray-900">Personal Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full Name</Label>
                <Input
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone Number</Label>
                <Input
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">City / Location</Label>
                <Input
                  value={profile?.city || ''}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="e.g. Coimbatore"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Bio</Label>
                <Input
                  value={profile?.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="Short bio"
                />
              </div>
            </div>

            {/* Business Details */}
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 pt-4">
              <Store className="text-blue-600" size={24} />
              <h3 className="text-lg font-bold text-gray-900">Business Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <Store size={14} /> Store / Business Name
                </Label>
                <Input
                  value={profile?.shop_name || ''}
                  onChange={(e) => setProfile({ ...profile, shop_name: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="e.g. Karthik Rentals"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <Phone size={14} /> Support Phone
                </Label>
                <Input
                  value={profile?.support_phone || ''}
                  onChange={(e) => setProfile({ ...profile, support_phone: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <MapPin size={14} /> Pickup Address
                </Label>
                <Input
                  value={profile?.pickup_address || ''}
                  onChange={(e) => setProfile({ ...profile, pickup_address: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="Street, Area, City"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <Clock size={14} /> Working Hours
                </Label>
                <Input
                  value={profile?.working_hours || ''}
                  onChange={(e) => setProfile({ ...profile, working_hours: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="e.g. 9:00 AM – 7:00 PM"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <Info size={14} /> GST Number (optional)
                </Label>
                <Input
                  value={profile?.gst_number || ''}
                  onChange={(e) => setProfile({ ...profile, gst_number: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
              <div className="flex items-center gap-3 mt-6">
                <input
                  type="checkbox"
                  id="delivery"
                  checked={profile?.delivery_available || false}
                  onChange={(e) => setProfile({ ...profile, delivery_available: e.target.checked })}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <Label htmlFor="delivery" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Truck size={14} /> Delivery Available
                </Label>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Business Description</Label>
                <textarea
                  value={profile?.business_description || ''}
                  onChange={(e) => setProfile({ ...profile, business_description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
                  placeholder="Describe your equipment, policies, rental terms..."
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
            <p className="text-sm text-red-700 mb-4">You can sign out of your account here.</p>
            <div className="flex gap-3">
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
