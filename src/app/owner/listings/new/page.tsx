'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Upload, X, ArrowRight, ArrowLeft, CheckCircle, Loader2,
  ImageIcon, Move, AlertCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES, INDIAN_CITIES } from '@/lib/data';
import { formatINR, calculatePrice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category_id: z.string().min(1, 'Select a category'),
  price_per_day: z.number().min(50, 'Minimum price is ₹50/day'),
  deposit_amount: z.number().min(0, 'Deposit cannot be negative'),
  city: z.string().min(1, 'Select a city'),
  area: z.string().min(2, 'Enter your area/locality'),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface UploadedImage {
  file: File;
  preview: string;
  url?: string;
  uploading?: boolean;
  error?: boolean;
}

const STEPS = [
  { id: 1, label: 'Details', description: 'Basic info' },
  { id: 2, label: 'Pricing', description: 'Set your rates' },
  { id: 3, label: 'Photos', description: 'Upload images' },
  { id: 4, label: 'Review', description: 'Final check' },
];

export default function NewListingPage() {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, [supabase]);

  const { register, handleSubmit, watch, formState: { errors }, trigger, setValue, getValues } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: { price_per_day: 500, deposit_amount: 2000, city: 'Coimbatore' },
  });

  const watchedPrice = watch('price_per_day') || 0;
  const watchedDeposit = watch('deposit_amount') || 0;
  const previewPricing = calculatePrice(watchedPrice, watchedDeposit, 3);

  // ---- Image handling ----
  const processFiles = useCallback(async (files: File[]) => {
    const validFiles = files.filter(f => f.type.startsWith('image/')).slice(0, 6 - images.length);
    if (!validFiles.length) return;

    const newImages: UploadedImage[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
    }));

    setImages(prev => [...prev, ...newImages]);

    // Upload each file to Supabase Storage
    for (let i = 0; i < newImages.length; i++) {
      const file = newImages[i].file;
      const ext = file.name.split('.').pop();
      const path = `listings/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (error) {
        setImages(prev => prev.map(img =>
          img.preview === newImages[i].preview
            ? { ...img, uploading: false, error: true }
            : img
        ));
        toast.error(`Failed to upload ${file.name}. Check if "product-images" bucket exists.`);
      } else {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        setImages(prev => prev.map(img =>
          img.preview === newImages[i].preview
            ? { ...img, uploading: false, url: urlData.publicUrl }
            : img
        ));
      }
    }
  }, [images.length, supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) processFiles(Array.from(e.dataTransfer.files));
  }, [processFiles]);

  const removeImage = (idx: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[idx].preview);
      updated.splice(idx, 1);
      return updated;
    });
  };

  // ---- Submit ----
  const onSubmit = async (data: ListingFormData) => {
    const successfulImages = images.filter(img => img.url && !img.error);
    if (successfulImages.length === 0) {
      toast.error('Please upload at least one photo.');
      return;
    }

    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Please sign in.'); setSubmitting(false); return; }

    // Insert product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        owner_id: user.id,
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        price_per_day: data.price_per_day,
        deposit_amount: data.deposit_amount,
        city: data.city,
        area: data.area,
        status: 'active',
      })
      .select()
      .single();

    if (productError || !product) {
      toast.error('Failed to create listing. Please try again.');
      setSubmitting(false);
      return;
    }

    // Insert images
    const imageRows = successfulImages.map((img, idx) => ({
      product_id: product.id,
      image_url: img.url!,
      order: idx,
    }));

    const { error: imgError } = await supabase.from('product_images').insert(imageRows);
    if (imgError) {
      toast.warning('Listing created but some images failed to save.');
    }

    toast.success('🎉 Listing published successfully!');
    router.push('/owner/listings');
  };

  const nextStep = async () => {
    const fieldsPerStep: (keyof ListingFormData)[][] = [
      ['title', 'description', 'category_id', 'city', 'area'],
      ['price_per_day', 'deposit_amount'],
      [],
      [],
    ];
    const valid = await trigger(fieldsPerStep[step - 1]);
    if (valid) setStep(s => Math.min(s + 1, 4));
  };

  const uploadedCount = images.filter(img => img.url).length;
  const uploadingCount = images.filter(img => img.uploading).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">List a New Product</h1>
        <p className="text-gray-500 mt-1">Fill in the details to start earning from your assets</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <button
              className={`flex items-center gap-2 flex-shrink-0 ${step > s.id ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => step > s.id && setStep(s.id)}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > s.id ? 'bg-green-500 text-white shadow-md' :
                step === s.id ? 'bg-blue-600 text-white shadow-md shadow-blue-200' :
                'bg-gray-100 text-gray-400'
              }`}>
                {step > s.id ? <CheckCircle size={18} /> : s.id}
              </div>
              <div className="hidden sm:block">
                <p className={`text-xs font-bold ${step >= s.id ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</p>
                <p className="text-xs text-gray-400">{s.description}</p>
              </div>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">

          {/* STEP 1: Details */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Product Details</h2>

              <div>
                <Label htmlFor="title" className="text-sm font-semibold text-gray-700 mb-1.5 block">Product Title *</Label>
                <Input id="title" placeholder="e.g., Sony Alpha A7S III Creator Kit" {...register('title')}
                  className={`h-12 rounded-xl ${errors.title ? 'border-red-400' : ''}`} />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700 mb-1.5 block">Description *</Label>
                <textarea id="description" {...register('description')} rows={4}
                  placeholder="Describe your product — condition, what's included, special notes..."
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Category *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map(cat => {
                    const selected = watch('category_id') === cat.id;
                    return (
                      <button key={cat.id} type="button" onClick={() => setValue('category_id', cat.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                          selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-200'
                        }`}>
                        <span>{cat.icon}</span>
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">City *</Label>
                  <select {...register('city')} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white h-11">
                    {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="area" className="text-sm font-semibold text-gray-700 mb-1.5 block">Area/Locality *</Label>
                  <Input id="area" placeholder="e.g., RS Puram" {...register('area')}
                    className={`h-11 rounded-xl ${errors.area ? 'border-red-400' : ''}`} />
                  {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Pricing */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Set Your Pricing</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price_per_day" className="text-sm font-semibold text-gray-700 mb-1.5 block">Daily Rate (₹) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                    <Input id="price_per_day" type="number" {...register('price_per_day', { valueAsNumber: true })}
                      className={`pl-8 h-12 rounded-xl ${errors.price_per_day ? 'border-red-400' : ''}`} />
                  </div>
                  {errors.price_per_day && <p className="text-red-500 text-xs mt-1">{errors.price_per_day.message}</p>}
                </div>
                <div>
                  <Label htmlFor="deposit_amount" className="text-sm font-semibold text-gray-700 mb-1.5 block">Deposit (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                    <Input id="deposit_amount" type="number" {...register('deposit_amount', { valueAsNumber: true })}
                      className="pl-8 h-12 rounded-xl" />
                  </div>
                </div>
              </div>

              {watchedPrice > 0 && (
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-sm font-bold text-blue-900 mb-3">📊 Preview: What renters pay for 3 days</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-700">
                      <span>{formatINR(watchedPrice)} × 3 days</span>
                      <span>{formatINR(previewPricing.rentalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Deposit (refundable)</span>
                      <span>{formatINR(previewPricing.depositAmount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-xs">
                      <span>Platform fee + GST</span>
                      <span>{formatINR(previewPricing.platformFee + previewPricing.gstAmount)}</span>
                    </div>
                    <div className="flex justify-between font-black text-blue-900 pt-2 border-t border-blue-200">
                      <span>Total renter pays</span>
                      <span>{formatINR(previewPricing.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-green-700 font-bold">
                      <span>You receive (after fees)</span>
                      <span>{formatINR(previewPricing.rentalAmount - previewPricing.platformFee)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-800">💡 Pricing tips:</p>
                <p>• Camera/drone: ₹1,500–₹5,000/day · Bikes: ₹300–₹800/day</p>
                <p>• Tools: ₹300–₹1,000/day · Event gear: ₹2,000–₹10,000/day</p>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Photos */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Product Photos</h2>
                  <p className="text-sm text-gray-500 mt-1">Upload up to 6 photos. Drag & drop supported.</p>
                </div>
                {uploadingCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 size={14} className="animate-spin" />
                    Uploading {uploadingCount}...
                  </div>
                )}
              </div>

              {/* Drop zone */}
              {images.length < 6 && (
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      isDragging ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Upload size={28} className={isDragging ? 'text-blue-600' : 'text-gray-400'} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">
                        {isDragging ? 'Drop your images here' : 'Click or drag & drop images'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB each · Max 6 photos</p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}

              {/* Image grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden group bg-gray-100">
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />

                      {/* Status overlays */}
                      {img.uploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="bg-white rounded-full p-2">
                            <Loader2 size={18} className="animate-spin text-blue-600" />
                          </div>
                        </div>
                      )}
                      {img.error && (
                        <div className="absolute inset-0 bg-red-500/60 flex items-center justify-center">
                          <div className="text-center text-white">
                            <AlertCircle size={24} className="mx-auto mb-1" />
                            <p className="text-xs font-semibold">Upload failed</p>
                          </div>
                        </div>
                      )}
                      {img.url && (
                        <div className="absolute top-2 left-2">
                          {idx === 0 ? (
                            <Badge className="bg-blue-600 text-white text-xs border-0">Main</Badge>
                          ) : null}
                        </div>
                      )}

                      {/* Remove btn */}
                      {!img.uploading && (
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  ))}

                  {images.length < 6 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-[4/3] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                    >
                      <ImageIcon size={24} />
                      <span className="text-xs font-medium">Add Photo</span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <span className="text-amber-600">💡</span>
                <span><strong className="text-amber-800">Tip:</strong> High-quality photos increase bookings by 3×. Shoot in good lighting.</span>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Review */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Review Your Listing</h2>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product</p>
                  <p className="font-bold text-gray-900 text-lg">{getValues('title')}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{getValues('description')}</p>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    📍 {getValues('area')}, {getValues('city')}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Pricing</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Daily rate</span>
                    <span className="font-black text-blue-600 text-lg">{formatINR(getValues('price_per_day'))}/day</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Deposit</span>
                    <span className="font-semibold">{formatINR(getValues('deposit_amount'))}</span>
                  </div>
                </div>

                {images.filter(img => img.url).length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Photos ({images.filter(img => img.url).length})
                    </p>
                    <div className="flex gap-2">
                      {images.filter(img => img.url).slice(0, 4).map((img, i) => (
                        <img key={i} src={img.preview} alt="" className="w-16 h-16 rounded-xl object-cover" />
                      ))}
                      {images.filter(img => img.url).length > 4 && (
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-500 font-bold">
                          +{images.filter(img => img.url).length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {uploadingCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <Loader2 size={16} className="animate-spin" />
                    {uploadingCount} image{uploadingCount > 1 ? 's' : ''} still uploading — please wait before submitting.
                  </div>
                )}

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm">
                  <p className="font-bold text-blue-900 mb-2">📋 What happens next?</p>
                  <ol className="text-blue-700 space-y-1 text-xs list-decimal list-inside">
                    <li>Your listing goes live immediately for renters to see</li>
                    <li>You'll receive booking requests in your dashboard</li>
                    <li>Accept or decline requests within 24 hours</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(s => Math.max(s - 1, 1))}
              disabled={step === 1}
              className="gap-2 h-12 px-5 rounded-xl font-semibold"
            >
              <ArrowLeft size={16} /> Back
            </Button>

            {step < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl h-12 px-6 font-bold shadow-sm"
              >
                Continue <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submitting || uploadingCount > 0}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl h-12 px-8 font-bold shadow-sm"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {submitting ? 'Publishing...' : 'Publish Listing 🚀'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
