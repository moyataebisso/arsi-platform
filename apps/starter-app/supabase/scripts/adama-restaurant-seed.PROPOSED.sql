-- ============================================================
-- ADAMA RESTAURANT — site_settings seed + module flags
-- ============================================================
-- TENANT: client_adama_restaurant (auth_id 459b3ebe-a69d-4306-9191-982af71f09c0)
--
-- This file is a PROPOSAL — review carefully, edit the values
-- you want to change, then run it in the Supabase SQL editor
-- with the service_role. Each UPSERT is idempotent.
--
-- Other tenants (Entrusted Care, Adama-test, etc.) are NOT
-- touched: every change is scoped to client_adama_restaurant.
-- ============================================================

SET search_path TO client_adama_restaurant, public;

-- ── 1. THEME + LAYOUT ──────────────────────────────────────
INSERT INTO site_settings (key, value_json) VALUES
  ('active_theme',         '"adamaGold"'),
  ('active_layout',        '"restaurant"'),
  ('selected_layout',      '"restaurant"'),
  ('active_hero_variant',  '"video_hero"'),
  ('font_heading',         '"Playfair Display"'),
  ('font_body',            '"DM Sans"'),
  ('color_header_bg',      '"#000000"'),
  ('color_footer_bg',      '"#000000"')
ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_at = NOW();

-- ── 2. BUSINESS PROFILE ────────────────────────────────────
INSERT INTO site_settings (key, value_json) VALUES
  ('business_name',  '"Adama Restaurant"'),
  ('tagline',        '"Your Finest Ethiopian Cuisine"'),
  ('business_story', '"Adama Restaurant is a family-owned Ethiopian kitchen in Columbia Heights, serving traditional injera, doro wat, and fresh-roasted coffee since opening day. Every meal is made from scratch using recipes passed down through generations."'),
  ('contact_email',  '"adamarestaurantmn@gmail.com"'),
  ('phone',          '"763-220-2897"'),
  ('contact_phone',  '"763-220-2897"'),
  ('address',        '"3970 Central Ave NE"'),
  ('city',           '"Columbia Heights"'),
  ('state',          '"MN"'),
  ('zip',            '"55421"'),
  ('hours',          '[
      {"day":"Sunday","hours":"11:00 AM – 9:00 PM"},
      {"day":"Monday","hours":"Closed"},
      {"day":"Tuesday","hours":"11:00 AM – 9:00 PM"},
      {"day":"Wednesday","hours":"11:00 AM – 9:00 PM"},
      {"day":"Thursday","hours":"11:00 AM – 9:00 PM"},
      {"day":"Friday","hours":"11:00 AM – 9:00 PM"},
      {"day":"Saturday","hours":"11:00 AM – 9:00 PM"}
   ]'),
  ('google_maps_embed', '"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2825.0!2d-93.250!3d45.046!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDXCsDAyJzQ1LjYiTiA5M8KwMTUnMDAuMCJX!5e0!3m2!1sen!2sus!4v1700000000000"'),
  ('cta_style',      '"phone"')   -- header + hero CTA renders as a tel: link to contact_phone
ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_at = NOW();

-- ── 3. SOCIAL LINKS (footer "FIND US ON") ─────────────────
INSERT INTO site_settings (key, value_json) VALUES
  ('social_facebook',  '"https://www.facebook.com/adamarestaurant/"'),
  ('social_instagram', '"https://www.instagram.com/adamarestaurant"'),
  -- Add Google profile URL when known. Leaving empty hides the icon.
  ('social_twitter',   '""'),
  ('social_linkedin',  '""')
ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_at = NOW();

-- ── 4. HERO (video + poster) ───────────────────────────────
-- Both keys are swappable per tenant. The poster MUST be set so the hero
-- never renders an empty box when the video is blocked, slow, or empty.
-- Source a free royalty-free Ethiopian food clip from Pexels / Coverr, host
-- it in Supabase Storage or any CDN, and paste the URL into hero_video_url.
-- If no good clip is available yet, leave hero_video_url as an empty string
-- and the poster image will render alone — an acceptable demo fallback.
INSERT INTO site_settings (key, value_json) VALUES
  ('hero_video_url',  '""'),
  ('hero_poster_url', '"https://images.unsplash.com/photo-1567337710282-00832b415979?w=1600&q=80"'),  -- placeholder Ethiopian food photo
  ('hero_image_url',  '"https://images.unsplash.com/photo-1567337710282-00832b415979?w=1600&q=80"'),
  ('hero_headline',     '"Adama Restaurant"'),
  ('hero_subheadline',  '"Your Finest Ethiopian Cuisine. Family-owned. Made from scratch."')
ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_at = NOW();

-- ── 5. LOGO (red urn) ──────────────────────────────────────
-- Replace with the actual hosted URL after upload. If left blank, the header
-- renders the brand name in Playfair gold serif as fallback.
INSERT INTO site_settings (key, value_json) VALUES
  ('logo_url', '""')
ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_at = NOW();

-- ── 6. PROMO BAR (top of nav) ──────────────────────────────
-- Set promo_bar_text to enable. Leave empty to hide.
INSERT INTO site_settings (key, value_json) VALUES
  ('promo_bar_text',      '""'),
  ('promo_bar_cta_url',   '""'),
  ('promo_bar_cta_label', '"Reserve Now"')
ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_at = NOW();

-- ── 7. ORDER / CATERING / PARTIES / JOBS CONTENT ──────────
INSERT INTO site_settings (key, value_json) VALUES
  ('order_mode',         '"linkout"'),         -- 'linkout' (default) | 'stripe' (phase 2)
  ('order_url',          '""'),                -- e.g. Toast/DoorDash external URL
  ('order_headline',     '"Order from Adama"'),
  ('order_intro',        '"Pickup and delivery available. Order online and we will have your meal ready."'),

  ('catering_headline',  '"Catering Services Available"'),
  ('catering_body',      '"From intimate gatherings to large corporate events, we bring the flavors of Ethiopia to your table. Get in touch to discuss pricing and availability."'),
  ('catering_image_url', '""'),
  ('catering_menu_url',  '""'),

  ('parties_headline',   '"Private Events at Adama"'),
  ('parties_body',       '"Host your celebration, rehearsal dinner, or corporate event with us. Custom menus available. Reach out and we will put together a plan."'),
  ('parties_image_url',  '""'),

  ('jobs_headline',      '"Work at Adama"'),
  ('jobs_body',          '"We are always looking for friendly, dependable people to join our kitchen and floor team. If that sounds like you, send us your resume."'),
  ('jobs_apply_email',   '"adamarestaurantmn@gmail.com"'),
  ('jobs_apply_url',     '""'),
  ('jobs_openings',      '[]')
ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_at = NOW();

-- ── 8. ENABLE FEATURE FLAGS (Adama-only — other tenants untouched) ─
-- enabled_modules is a JSON map merged over siteConfig.modules defaults.
-- Only the keys listed here flip true; everything not listed inherits the
-- siteConfig.modules default (false for all unrelated modules).
INSERT INTO site_settings (key, value_json) VALUES
  ('enabled_modules', '{
      "booking": true,
      "leads": true,
      "gallery": true,
      "drinks": true,
      "order_online": true,
      "parties": true,
      "catering": true,
      "jobs": true
   }')
ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_at = NOW();

-- ── 9. VERIFY ──────────────────────────────────────────────
-- Quick sanity check — should return ~30 rows.
SELECT key, value_json FROM site_settings WHERE key IN (
  'active_theme', 'active_layout', 'active_hero_variant',
  'business_name', 'phone', 'address', 'hours',
  'hero_video_url', 'hero_poster_url', 'logo_url',
  'enabled_modules', 'cta_style',
  'social_facebook', 'social_instagram',
  'promo_bar_text', 'order_url',
  'catering_headline', 'parties_headline', 'jobs_apply_email'
) ORDER BY key;
