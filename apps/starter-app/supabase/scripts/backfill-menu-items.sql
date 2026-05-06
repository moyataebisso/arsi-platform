-- ============================================================
-- One-shot backfill: add menu_items table to every existing
-- client_* schema. Safe to re-run (uses IF NOT EXISTS).
-- Run this in the Supabase SQL editor with service_role.
-- ============================================================

DO $$
DECLARE
  schema_record RECORD;
BEGIN
  FOR schema_record IN
    SELECT nspname FROM pg_namespace WHERE nspname LIKE 'client_%'
  LOOP
    EXECUTE format($f$
      CREATE TABLE IF NOT EXISTS %I.menu_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        description text,
        price numeric(10,2),
        category text DEFAULT 'main' CHECK (category IN ('starter', 'main', 'dessert', 'drink', 'side')),
        is_featured boolean DEFAULT false,
        is_active boolean DEFAULT true,
        display_order integer DEFAULT 0,
        image_url text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    $f$, schema_record.nspname);

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_menu_items_active ON %I.menu_items(is_active);',
      schema_record.nspname
    );
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_menu_items_featured ON %I.menu_items(is_featured);',
      schema_record.nspname
    );
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_menu_items_category ON %I.menu_items(category);',
      schema_record.nspname
    );

    RAISE NOTICE 'menu_items ensured in schema: %', schema_record.nspname;
  END LOOP;
END $$;
