-- Supabase / Postgres schema for Collector Garage
-- This schema matches the data access layer used by the app.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS garages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  address text,
  latitude numeric,
  longitude numeric,
  capacity integer,
  description text,
  image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  make text,
  model text,
  type text,
  custom_type text,
  is_public boolean DEFAULT false,
  status text,
  year text,
  vin text,
  license_plate_number text,
  engine_number text,
  color text,
  mileage text,
  location text,
  garage text,
  specs text,
  photos text,
  maintenance_records text,
  maintenance_date date,
  next_maintenance_date date,
  maintenance_reminder_enabled boolean DEFAULT false,
  license_info text,
  licence_date date,
  next_licence_date date,
  licence_reminder_enabled boolean DEFAULT false,
  protection_date date,
  next_protection_date date,
  protection_reminder_enabled boolean DEFAULT false,
  restoration_history text,
  tuning_details text,
  spare_keys text,
  documents text,
  comments text,
  timeline text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS garage_spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id uuid REFERENCES garages(id) ON DELETE CASCADE ON UPDATE CASCADE,
  spot_number text,
  description text,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL ON UPDATE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL ON UPDATE CASCADE,
  garage_id uuid REFERENCES garages(id) ON DELETE SET NULL ON UPDATE CASCADE,
  type text,
  title text,
  due_date timestamptz,
  status text,
  enabled boolean DEFAULT true,
  completed boolean DEFAULT false,
  last_sent_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicle_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  description text,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS key_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  description text,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_garage_spots_garage_id ON garage_spots(garage_id);
CREATE INDEX IF NOT EXISTS idx_garage_spots_vehicle_id ON garage_spots(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_notifications_vehicle_id ON notifications(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_notifications_garage_id ON notifications(garage_id);

ALTER TABLE garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_locations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'garages' AND policyname = 'allow_public_all') THEN
    CREATE POLICY allow_public_all ON public.garages FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vehicles' AND policyname = 'allow_public_all') THEN
    CREATE POLICY allow_public_all ON public.vehicles FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'garage_spots' AND policyname = 'allow_public_all') THEN
    CREATE POLICY allow_public_all ON public.garage_spots FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'allow_public_all') THEN
    CREATE POLICY allow_public_all ON public.notifications FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admin_settings' AND policyname = 'allow_public_all') THEN
    CREATE POLICY allow_public_all ON public.admin_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vehicle_types' AND policyname = 'allow_public_all') THEN
    CREATE POLICY allow_public_all ON public.vehicle_types FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'key_locations' AND policyname = 'allow_public_all') THEN
    CREATE POLICY allow_public_all ON public.key_locations FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
