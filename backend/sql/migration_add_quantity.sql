-- Migration: Add quantity column to equipment table
-- Default to 1 for existing equipment

ALTER TABLE equipment 
ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1);

