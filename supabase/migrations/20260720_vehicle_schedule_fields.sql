ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS maintenance_date date,
  ADD COLUMN IF NOT EXISTS next_maintenance_date date,
  ADD COLUMN IF NOT EXISTS maintenance_reminder_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS protection_date date,
  ADD COLUMN IF NOT EXISTS next_protection_date date,
  ADD COLUMN IF NOT EXISTS protection_reminder_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS licence_date date,
  ADD COLUMN IF NOT EXISTS next_licence_date date,
  ADD COLUMN IF NOT EXISTS licence_reminder_enabled boolean DEFAULT false;