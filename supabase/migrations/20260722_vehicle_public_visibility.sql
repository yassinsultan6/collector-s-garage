ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
