-- ==========================================
-- E-COMMERCE DATABASE SCHEMA FOR SUPABASE
-- ==========================================
-- Run this entire script in your Supabase SQL Editor.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES CREATION
-- ==========================================

-- PROFILES (Linked to Clerk Authentication)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    banner_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    sale_price NUMERIC(10, 2),
    sku TEXT UNIQUE,
    stock_quantity INT DEFAULT 0,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    featured_image TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    sizes TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADDRESSES
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false
);

-- WISHLIST
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- ORDERS
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    order_number TEXT UNIQUE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    fulfillment_status TEXT DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL
);

-- REVIEWS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COUPONS
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
    discount_value NUMERIC(10, 2) NOT NULL,
    minimum_order NUMERIC(10, 2) DEFAULT 0,
    expiry_date TIMESTAMPTZ,
    usage_limit INT,
    active BOOLEAN DEFAULT true
);

-- INVENTORY (Advanced Tracking)
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID UNIQUE REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 10,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SHIPPING ZONES
CREATE TABLE shipping_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    regions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SHIPPING METHODS (Belongs to a zone)
CREATE TABLE shipping_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID REFERENCES shipping_zones(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    min_delivery_days INT,
    max_delivery_days INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RETURN POLICIES
CREATE TABLE return_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    return_window_days INT NOT NULL DEFAULT 30,
    refund_type TEXT DEFAULT 'full' CHECK (refund_type IN ('full', 'partial', 'store_credit', 'exchange')),
    conditions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMIN NOTIFICATIONS
CREATE TABLE admin_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL, -- 'new_order', 'low_stock', 'order_status'
    title TEXT NOT NULL,
    message TEXT,
    metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- NOTE: For this local/demo project, we are creating permissive policies 
-- that rely on client-side and Edge Function auth filtering, or simplified rules.
-- In a strict production setting, you would enforce RLS based on auth.uid() or custom JWT claims from Clerk.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read access to public tables
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Public categories are viewable by everyone." ON categories FOR SELECT USING (true);
CREATE POLICY "Public products are viewable by everyone." ON products FOR SELECT USING (status = 'published');
CREATE POLICY "Public reviews are viewable by everyone." ON reviews FOR SELECT USING (status = 'approved');

-- Allow all operations for now (Since Clerk auth bypasses Supabase native Auth.uid())
-- To properly secure this with Clerk, you must pass the Clerk JWT to Supabase.
-- For the sake of this implementation, we will use Anon Key bypass policies to allow the client to read/write.
-- In production: CREATE POLICY "..." USING (auth.jwt() ->> 'sub' = clerk_user_id);

CREATE POLICY "Allow all operations for anon" ON profiles USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON categories USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON products USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON addresses USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON wishlist USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON orders USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON order_items USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON reviews USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON coupons USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON inventory USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON shipping_zones USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON shipping_methods USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON return_policies USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON admin_notifications USING (true) WITH CHECK (true);

-- ==========================================
-- 3. STORAGE BUCKETS
-- ==========================================
-- Create buckets for images.
-- Note: Supabase requires you to insert into the storage.buckets table.

INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('category-images', 'category-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true) ON CONFLICT (id) DO NOTHING;

-- Set up permissive storage policies for the buckets
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('product-images', 'category-images', 'banners', 'profile-images'));
CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('product-images', 'category-images', 'banners', 'profile-images'));
CREATE POLICY "Allow updates" ON storage.objects FOR UPDATE USING (bucket_id IN ('product-images', 'category-images', 'banners', 'profile-images'));
CREATE POLICY "Allow deletes" ON storage.objects FOR DELETE USING (bucket_id IN ('product-images', 'category-images', 'banners', 'profile-images'));
