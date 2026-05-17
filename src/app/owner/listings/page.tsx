'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Edit, Trash2, PauseCircle, PlayCircle, Eye, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { formatINR, getProductStatusColor } from '@/lib/utils';
import { toast } from 'sonner';

interface Listing {
  id: string;
  title: string;
  price_per_day: number;
  status: string;
  city: string;
  area: string;
  rating: number | null;
  review_count: number;
  created_at: string;
  product_images: { image_url: string; order: number }[];
}

export default function OwnerListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchListings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(image_url, order)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) setListings(data as Listing[]);
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === 'active' ? 'paused' : 'active';
    const { error } = await supabase.from('products').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      toast.success(`Listing ${newStatus === 'active' ? 'activated' : 'paused'}`);
    }
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;
    setDeletingId(id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setListings(prev => prev.filter(l => l.id !== id));
      toast.success('Listing deleted');
    } else {
      toast.error('Failed to delete listing');
    }
    setDeletingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Listings</h1>
          <p className="text-gray-500 mt-1">{listings.length} product{listings.length !== 1 ? 's' : ''} listed</p>
        </div>
        <Link href="/owner/listings/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-5 font-bold gap-2">
            <Plus size={18} /> Add Listing
          </Button>
        </Link>
      </motion.div>

      {/* Listings */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : listings.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Package size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No listings yet</h3>
          <p className="text-gray-500 mb-6">Start earning by listing your first item on Rento.</p>
          <Link href="/owner/listings/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 font-bold">
              + Create Your First Listing
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing, i) => {
            const thumbUrl = listing.product_images?.[0]?.image_url;
            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {thumbUrl ? (
                      <img src={thumbUrl} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={28} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900 truncate">{listing.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{listing.area}, {listing.city}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-lg font-black text-blue-600">{formatINR(listing.price_per_day)}<span className="text-xs text-gray-400 font-normal">/day</span></span>
                          {listing.rating && (
                            <span className="text-xs text-gray-500">⭐ {listing.rating} ({listing.review_count})</span>
                          )}
                        </div>
                      </div>
                      <Badge className={`text-xs border-0 flex-shrink-0 ${getProductStatusColor(listing.status)}`}>
                        {listing.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/product/${listing.id}`} target="_blank">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-gray-500 hover:text-blue-600">
                        <Eye size={17} />
                      </Button>
                    </Link>

                    <Button
                      variant="ghost" size="icon"
                      className={`h-9 w-9 rounded-xl ${listing.status === 'active' ? 'text-amber-500 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                      onClick={() => toggleStatus(listing.id, listing.status)}
                      title={listing.status === 'active' ? 'Pause listing' : 'Activate listing'}
                    >
                      {listing.status === 'active' ? <PauseCircle size={17} /> : <PlayCircle size={17} />}
                    </Button>

                    <Button
                      variant="ghost" size="icon"
                      className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50"
                      onClick={() => deleteListing(listing.id)}
                      disabled={deletingId === listing.id}
                    >
                      {deletingId === listing.id ? <Loader2 size={17} className="animate-spin" /> : <Trash2 size={17} />}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
