-- Create users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('MAGACIN_ADMIN', 'REZERVACIJA', 'PREUZIMANJE')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create items table for inventory management
-- Changed all quantity fields to INTEGER for whole numbers
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  project TEXT DEFAULT 'Skladište',
  name TEXT NOT NULL,
  supplier TEXT,
  price DECIMAL(10, 2),
  input INTEGER DEFAULT 0,
  okov_ime TEXT,
  okov_cena DECIMAL(10, 2),
  okov_kom INTEGER DEFAULT 0,
  ploce_ime TEXT,
  ploce_cena DECIMAL(10, 2),
  ploce_kom INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reservations table
-- Added reservation_code, reserved_by, reserved_at columns and changed quantity to INTEGER
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  reserved_by TEXT NOT NULL,
  reserved_at TIMESTAMPTZ DEFAULT NOW(),
  reservation_code TEXT,
  notes TEXT
);

-- Create pickups table
-- Added pickup_code, picked_up_by, picked_up_at columns and changed quantity to INTEGER
CREATE TABLE IF NOT EXISTS pickups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  picked_up_by TEXT NOT NULL,
  picked_up_at TIMESTAMPTZ DEFAULT NOW(),
  confirmation_code TEXT,
  confirmed_at TIMESTAMPTZ,
  notes TEXT
);

-- Create input_history table to track all inputs with prices
-- Changed quantity to INTEGER
CREATE TABLE IF NOT EXISTS input_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2),
  supplier TEXT,
  input_date TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_code ON items(code);
CREATE INDEX IF NOT EXISTS idx_items_project ON items(project);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_supplier ON items(supplier);
CREATE INDEX IF NOT EXISTS idx_reservations_item_id ON reservations(item_id);
CREATE INDEX IF NOT EXISTS idx_pickups_item_id ON pickups(item_id);
CREATE INDEX IF NOT EXISTS idx_input_history_item_id ON input_history(item_id);
</parameter>
