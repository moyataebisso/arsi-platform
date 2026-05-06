-- ============================================================
-- Add menu_items table to public schema.
-- Provisioning's clone_public_to_schema picks this up for new
-- client schemas. For existing client schemas, run the matching
-- backfill script: supabase/scripts/backfill-menu-items.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2),
  -- category is free text (e.g. 'starter', 'main', 'appetizer', 'salad', 'specials').
  -- The /menu page sorts known categories first; unknown categories are appended.
  category text DEFAULT 'main',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_active ON public.menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_featured ON public.menu_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category);
