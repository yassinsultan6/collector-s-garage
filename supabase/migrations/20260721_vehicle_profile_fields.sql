ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS make text,
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS vin text,
  ADD COLUMN IF NOT EXISTS license_plate_number text,
  ADD COLUMN IF NOT EXISTS engine_number text,
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS mileage text;
