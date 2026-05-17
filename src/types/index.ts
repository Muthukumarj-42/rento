// ============================================
// RENTO — Core Type Definitions
// ============================================

export type UserRole = 'customer' | 'owner' | 'admin';
export type KycStatus = 'pending' | 'submitted' | 'verified' | 'rejected';
export type ProductStatus = 'draft' | 'pending_approval' | 'active' | 'paused' | 'rejected';
export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'disputed';
export type DeliveryType = 'pickup' | 'delivery';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// ---- User / Profile ----
export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
  city?: string;
  bio?: string;
  role: UserRole;
  kyc_status: KycStatus;
  onboarding_completed: boolean;
  created_at: string;
}

// ---- Owner Profile ----
export interface OwnerProfile {
  user_id: string;
  shop_name: string;
  aadhaar_url?: string;
  pan_url?: string;
  verified: boolean;
  bank_account?: string;
  ifsc_code?: string;
  city: string;
  bio?: string;
}

// ---- Category ----
export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
  description?: string;
}

// ---- Product ----
export interface Product {
  id: string;
  owner_id: string;
  category_id: string;
  title: string;
  description: string;
  price_per_day: number;
  deposit_amount: number;
  city: string;
  area?: string;
  lat?: number;
  lng?: number;
  status: ProductStatus;
  rating?: number;
  review_count?: number;
  is_featured?: boolean;
  created_at: string;
  // Joined
  images?: ProductImage[];
  category?: Category;
  owner?: Partial<User> & { owner_profile?: OwnerProfile };
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  order: number;
}

// ---- Booking ----
export interface Booking {
  id: string;
  product_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  days: number;
  rental_amount: number;
  deposit_amount: number;
  platform_fee: number;
  gst_amount: number;
  total_amount: number;
  delivery_type: DeliveryType;
  delivery_address?: string;
  status: BookingStatus;
  created_at: string;
  // Joined
  product?: Partial<Product>;
  renter?: Partial<User>;
  payment?: Payment;
}

// ---- Payment ----
export interface Payment {
  id: string;
  booking_id: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
}

// ---- Review ----
export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  product_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: Partial<User>;
}

// ---- Notification ----
export interface Notification {
  id: string;
  user_id: string;
  type: 'booking_request' | 'booking_accepted' | 'booking_rejected' | 'payment_success' | 'return_reminder' | 'chat_message';
  title: string;
  body: string;
  read: boolean;
  link?: string;
  created_at: string;
}

// ---- Chat ----
export interface ChatMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  read: boolean;
  created_at: string;
  sender?: Partial<User>;
}

// ---- Price Calculation ----
export interface PriceBreakdown {
  days: number;
  rentalAmount: number;
  depositAmount: number;
  platformFee: number;
  gstAmount: number;
  totalAmount: number;
}

// ---- Search / Filter ----
export interface SearchFilters {
  query?: string;
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  availableFrom?: string;
  availableTo?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  rating?: number;
}

// ---- Razorpay ----
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// ---- Dashboard Stats ----
export interface OwnerStats {
  totalEarnings: number;
  activeRentals: number;
  pendingBookings: number;
  totalListings: number;
  monthlyRevenue: { month: string; revenue: number }[];
}

export interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  totalProducts: number;
  totalBookings: number;
  pendingApprovals: number;
  platformRevenue: number;
}
