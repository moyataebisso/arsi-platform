-- ============================================================
-- ARSI STARTER-APP -- Complete Database Schema
-- Run in client's Supabase SQL Editor during onboarding
-- Safe to re-run: all DROP IF EXISTS + ON CONFLICT
-- ============================================================

-- DROP TABLES (reverse order to respect foreign keys)
DROP TABLE IF EXISTS blog_post_categories CASCADE;
DROP TABLE IF EXISTS blog_categories CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS availability CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS form_submissions CASCADE;
DROP TABLE IF EXISTS contact_forms CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- CORE TABLES (always created)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user','staff','manager','admin')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value_json JSONB,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content_json JSONB DEFAULT '{}',
  meta_description TEXT,
  is_published BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  trigger_event TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES email_templates(id),
  recipient_email TEXT NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent','failed','bounced')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEADS MODULE (created when leads = true)
CREATE TABLE contact_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  fields_json JSONB DEFAULT '[]',
  success_message TEXT DEFAULT 'Thank you! We will be in touch shortly.',
  email_to TEXT,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES contact_forms(id),
  data_json JSONB NOT NULL,
  source_page TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES form_submissions(id),
  name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','converted','lost')),
  assigned_to UUID REFERENCES users(id),
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOKING MODULE (created when booking = true)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration_min INTEGER DEFAULT 60,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  max_capacity INTEGER DEFAULT 1,
  requires_prepayment BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME,
  end_time TIME,
  is_recurring BOOLEAN DEFAULT true,
  specific_date DATE
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  service_id UUID REFERENCES services(id),
  date DATE NOT NULL,
  time_slot TIME NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','cancelled','completed','no-show')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ECOMMERCE MODULE (created when ecommerce = true)
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES product_categories(id),
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  sku TEXT UNIQUE,
  stock_qty INTEGER DEFAULT 0,
  category_id UUID REFERENCES product_categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','processing','shipped','delivered','refunded','cancelled','failed')),
  payment_provider TEXT,
  payment_id TEXT,
  stripe_session_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL
);

-- BLOG MODULE (created when blog = true)
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content_html TEXT,
  excerpt TEXT,
  author_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled','archived')),
  published_at TIMESTAMPTZ,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE blog_post_categories (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- ROW LEVEL SECURITY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_categories ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "users_own_data" ON users FOR ALL USING (auth.uid() = auth_id);
-- Public can read published pages + products + blog posts
CREATE POLICY "public_pages" ON pages FOR SELECT USING (is_published = true);
CREATE POLICY "public_products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "public_blog" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "public_services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "public_categories" ON product_categories FOR SELECT USING (true);
CREATE POLICY "public_blog_categories" ON blog_categories FOR SELECT USING (true);
CREATE POLICY "public_blog_post_categories" ON blog_post_categories FOR SELECT USING (true);
CREATE POLICY "public_availability" ON availability FOR SELECT USING (true);
CREATE POLICY "public_contact_forms" ON contact_forms FOR SELECT USING (is_active = true);
-- Users can manage their own cart, bookings, orders
CREATE POLICY "user_cart" ON cart_items FOR ALL USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
CREATE POLICY "user_bookings" ON bookings FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
CREATE POLICY "user_orders" ON orders FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
CREATE POLICY "user_notifications" ON notifications FOR ALL USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
-- Admins can do everything (service role bypasses RLS)
CREATE POLICY "admin_all_users" ON users FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin','manager'))
);

-- STORAGE BUCKET
-- Creates the site-media bucket for image uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-media', 'site-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (DROP first to avoid conflicts on re-run)
DROP POLICY IF EXISTS "auth_upload" ON storage.objects;
DROP POLICY IF EXISTS "public_read" ON storage.objects;
DROP POLICY IF EXISTS "auth_delete" ON storage.objects;

CREATE POLICY "auth_upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'site-media');

CREATE POLICY "public_read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'site-media');

CREATE POLICY "auth_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'site-media');
