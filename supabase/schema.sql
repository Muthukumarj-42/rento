-- ============================================
-- RENTO — PostgreSQL Schema (Supabase)
-- ============================================
-- Run this in your Supabase SQL editor

-- ---- Extensions ----
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (formerly users)
-- ============================================
-- 1. Rename existing users table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    ALTER TABLE public.users RENAME TO profiles;
  END IF;
END $$;

-- 2. Create profiles if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                TEXT UNIQUE,
  phone                TEXT,
  full_name            TEXT,
  avatar_url           TEXT,
  city                 TEXT,
  bio                  TEXT,
  role                 TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'owner', 'admin')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  kyc_status           TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'verified', 'rejected')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Add any missing columns
DO $$
BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
  -- Business fields for owners
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shop_name TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pickup_address TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS support_phone TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS working_hours TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gst_number TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS delivery_available BOOLEAN DEFAULT FALSE;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_description TEXT;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;



-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  icon        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.categories (name, icon, slug, description) VALUES
  ('Creator Gear', '🎬', 'creator-gear', 'Cameras, lighting, microphones'),
  ('Cameras', '📷', 'cameras', 'DSLRs, mirrorless, action cams'),
  ('Drones', '🚁', 'drones', 'FPV drones, aerial photography'),
  ('Bikes', '🚲', 'bikes', 'Bicycles, e-bikes, scooters'),
  ('Electronics', '💻', 'electronics', 'Laptops, tablets, gadgets'),
  ('Tools', '🔧', 'tools', 'Power tools, hand tools'),
  ('Event Equipment', '🎤', 'event-equipment', 'Sound, lighting, stages'),
  ('Machinery', '⚙️', 'machinery', 'Industrial equipment'),
  ('Food Carts', '🍕', 'food-carts', 'Mobile food stations'),
  ('Student Essentials', '📚', 'student-essentials', 'Study tools, instruments')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES public.categories(id),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  price_per_day   NUMERIC(10, 2) NOT NULL CHECK (price_per_day >= 0),
  deposit_amount  NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
  city            TEXT NOT NULL DEFAULT 'Coimbatore',
  area            TEXT,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'rejected')),
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_available BOOLEAN NOT NULL DEFAULT FALSE,
  rating          NUMERIC(3, 2),
  review_count    INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add delivery_available to existing products table if it doesn't have it
DO $$
BEGIN
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS delivery_available BOOLEAN NOT NULL DEFAULT FALSE;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- ============================================
-- PRODUCT IMAGES
-- ============================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  "order"     INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_availability (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  available   BOOLEAN NOT NULL DEFAULT FALSE,
  booking_id  UUID,
  UNIQUE (product_id, date)
);

-- ============================================
-- BOOKINGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id       UUID NOT NULL REFERENCES public.products(id),
  renter_id        UUID NOT NULL REFERENCES public.profiles(id),
  owner_id         UUID NOT NULL REFERENCES public.profiles(id),
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  days             INT NOT NULL,
  rental_amount    NUMERIC(10, 2) NOT NULL,
  deposit_amount   NUMERIC(10, 2) NOT NULL DEFAULT 0,
  platform_fee     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  gst_amount       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount     NUMERIC(10, 2) NOT NULL,
  delivery_type    TEXT NOT NULL DEFAULT 'pickup' CHECK (delivery_type IN ('pickup', 'delivery')),
  delivery_address TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled', 'disputed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_dates CHECK (end_date >= start_date)
);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id            UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  razorpay_order_id     TEXT,
  razorpay_payment_id   TEXT,
  amount                NUMERIC(10, 2) NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'INR',
  status                TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  type        TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'refund', 'withdrawal')),
  amount      NUMERIC(10, 2) NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- REVIEWS & FAVORITES
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id   UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id  UUID NOT NULL REFERENCES public.profiles(id),
  reviewee_id  UUID NOT NULL REFERENCES public.profiles(id),
  product_id   UUID NOT NULL REFERENCES public.products(id),
  rating       INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (booking_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS public.favorites (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ============================================
-- NOTIFICATIONS & CHAT
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  link        TEXT,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chats (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id   UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id    UUID NOT NULL REFERENCES public.profiles(id),
  receiver_id  UUID NOT NULL REFERENCES public.profiles(id),
  message      TEXT NOT NULL,
  read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- STORAGE BUCKETS (run separately or in dashboard)
-- ============================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, own write
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Products: public can view active, owners manage own
DROP POLICY IF EXISTS "products_select_active" ON public.products;
CREATE POLICY "products_select_active" ON public.products
  FOR SELECT USING (status = 'active' OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "products_insert_owner" ON public.products;
CREATE POLICY "products_insert_owner" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "products_update_owner" ON public.products;
CREATE POLICY "products_update_owner" ON public.products
  FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "products_delete_owner" ON public.products;
CREATE POLICY "products_delete_owner" ON public.products
  FOR DELETE USING (auth.uid() = owner_id);

-- Product images: public read, owner write
DROP POLICY IF EXISTS "product_images_select" ON public.product_images;
CREATE POLICY "product_images_select" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "product_images_insert" ON public.product_images;
CREATE POLICY "product_images_insert" ON public.product_images
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT owner_id FROM public.products WHERE id = product_id)
  );

DROP POLICY IF EXISTS "product_images_delete" ON public.product_images;
CREATE POLICY "product_images_delete" ON public.product_images
  FOR DELETE USING (
    auth.uid() = (SELECT owner_id FROM public.products WHERE id = product_id)
  );

-- Bookings
DROP POLICY IF EXISTS "bookings_select" ON public.bookings;
CREATE POLICY "bookings_select" ON public.bookings
  FOR SELECT USING (auth.uid() = renter_id OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "bookings_insert" ON public.bookings;
CREATE POLICY "bookings_insert" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = renter_id);

DROP POLICY IF EXISTS "bookings_update_owner" ON public.bookings;
CREATE POLICY "bookings_update_owner" ON public.bookings
  FOR UPDATE USING (auth.uid() = owner_id OR auth.uid() = renter_id);

-- Favorites: own only
DROP POLICY IF EXISTS "favorites_own" ON public.favorites;
CREATE POLICY "favorites_own" ON public.favorites USING (auth.uid() = user_id);

-- Notifications: own only
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own" ON public.notifications USING (auth.uid() = user_id);

-- Chats: sender or receiver
DROP POLICY IF EXISTS "chats_access" ON public.chats;
CREATE POLICY "chats_access" ON public.chats
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "chats_insert" ON public.chats;
CREATE POLICY "chats_insert" ON public.chats
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Storage policies (run in Supabase dashboard or SQL editor)
-- CREATE POLICY "product_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
-- CREATE POLICY "product_images_auth_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "avatars_auth_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_city ON public.products(city);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_owner ON public.products(owner_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_bookings_renter ON public.bookings(renter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_owner ON public.bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_product ON public.bookings(product_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- ============================================
-- REALTIME
-- ============================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
