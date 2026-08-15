-- Per-tenant SEO: seed site_settings.service_type so the LocalBusiness
-- JSON-LD component (src/components/seo/JsonLd.tsx) can emit the correct
-- schema.org @type per tenant.
--
-- MANUAL RUN ONLY. Review in Supabase SQL Editor before executing. Each
-- INSERT targets a client_* schema and should run against a database where
-- that schema exists.
--
-- The public.site_settings table already has value_json jsonb (see the
-- initial schema); the ALTER below is defensive and idempotent for older
-- environments.

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS value_json jsonb;

-- El Roi Health Services
INSERT INTO client_el_roi_health_services.site_settings (key, value_json)
VALUES ('service_type', '"Home Health Care"'::jsonb)
ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json;

-- Entrusted Care Residence
INSERT INTO client_entrusted_care_residence.site_settings (key, value_json)
VALUES ('service_type', '"Assisted Living"'::jsonb)
ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json;

-- Adama Restaurant (when it goes live)
INSERT INTO client_adama_restaurant.site_settings (key, value_json)
VALUES ('service_type', '"Restaurant"'::jsonb)
ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json;
