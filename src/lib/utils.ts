import { type PriceBreakdown } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---- Currency Formatter ----
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ---- Price Calculation ----
export const PLATFORM_FEE_RATE = 0.025; // 2.5%
export const GST_RATE = 0.18; // 18% on platform fee only

export function calculatePrice(
  pricePerDay: number,
  depositAmount: number,
  days: number
): PriceBreakdown {
  const rentalAmount = pricePerDay * days;
  const platformFee = Math.round(rentalAmount * PLATFORM_FEE_RATE);
  const gstAmount = Math.round(platformFee * GST_RATE);
  const totalAmount = rentalAmount + depositAmount + platformFee + gstAmount;

  return {
    days,
    rentalAmount,
    depositAmount,
    platformFee,
    gstAmount,
    totalAmount,
  };
}

// ---- Date Utils ----
export function daysBetween(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
}

// ---- Status Badges ----
export function getBookingStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-50 text-red-600',
    disputed: 'bg-orange-100 text-orange-800',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

export function getProductStatusColor(status: string): string {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    pending_approval: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

// ---- Truncate ----
export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

// ---- Slugify ----
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ---- Razorpay ----
export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as unknown as Record<string, unknown>)['Razorpay']) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
