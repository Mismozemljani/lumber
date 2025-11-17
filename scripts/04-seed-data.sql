-- Seed users
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin Korisnik', 'admin@magacin.rs', '$2a$10$dummyhash1', 'MAGACIN_ADMIN'),
  ('Rezervacija Korisnik', 'rezervacija@magacin.rs', '$2a$10$dummyhash2', 'REZERVACIJA'),
  ('Preuzimanje Korisnik', 'preuzimanje@magacin.rs', '$2a$10$dummyhash3', 'PREUZIMANJE'),
  ('Marko Marković', 'marko@magacin.rs', '$2a$10$dummyhash4', 'REZERVACIJA'),
  ('Ana Anić', 'ana@magacin.rs', '$2a$10$dummyhash5', 'PREUZIMANJE')
ON CONFLICT (email) DO NOTHING;

-- Seed items
INSERT INTO items (code, project, name, supplier, price, input, hardware_name, hardware_price, hardware_quantity, panels_name, panels_price, panels_quantity, low_stock_threshold) VALUES
  ('WH-001', 'Projekat A', 'Vijci M6x20', 'Dobavljač 1', 0.50, 1000, 'Čelik', 0.45, 500, 'N/A', 0, 0, 100),
  ('WH-002', 'Projekat A', 'Matice M6', 'Dobavljač 1', 0.30, 800, 'Čelik', 0.28, 400, 'N/A', 0, 0, 100),
  ('WH-003', 'Projekat B', 'Šrafovi M8x30', 'Dobavljač 2', 0.75, 500, 'Inox', 0.70, 250, 'N/A', 0, 0, 50),
  ('WH-004', 'Projekat B', 'Podloške 8mm', 'Dobavljač 2', 0.20, 1200, 'Čelik', 0.18, 600, 'N/A', 0, 0, 150),
  ('WH-005', 'Projekat C', 'Kablovi 2.5mm', 'Dobavljač 3', 2.50, 300, 'Bakar', 2.30, 150, 'PVC', 0.20, 150, 30),
  ('WH-006', 'Projekat C', 'Prekidači', 'Dobavljač 3', 5.00, 200, 'Plastika', 4.50, 100, 'Metal', 0.50, 100, 20),
  ('WH-007', 'Projekat D', 'LED Sijalice', 'Dobavljač 4', 8.00, 150, 'LED', 7.50, 75, 'Aluminijum', 0.50, 75, 15),
  ('WH-008', 'Projekat D', 'Utičnice', 'Dobavljač 4', 3.50, 250, 'Plastika', 3.20, 125, 'Metal', 0.30, 125, 25)
ON CONFLICT DO NOTHING;

-- Seed input history
INSERT INTO input_history (item_id, quantity, price, supplier, input_date) 
SELECT id, input, price, supplier, NOW() - INTERVAL '30 days'
FROM items;

-- Seed some reservations
INSERT INTO reservations (item_id, quantity, reserved_by, reserved_at, reservation_code) 
SELECT id, 50, 'Marko Marković', NOW() - INTERVAL '2 days', 'RES001'
FROM items WHERE code = 'WH-001';

INSERT INTO reservations (item_id, quantity, reserved_by, reserved_at, reservation_code) 
SELECT id, 30, 'Ana Anić', NOW() - INTERVAL '1 day', 'RES002'
FROM items WHERE code = 'WH-003';

-- Seed some pickups
INSERT INTO pickups (item_id, quantity, picked_up_by, picked_up_at, confirmation_code, confirmed_at) 
SELECT id, 100, 'Marko Marković', NOW() - INTERVAL '5 days', 'ABC123', NOW() - INTERVAL '5 days'
FROM items WHERE code = 'WH-001';

INSERT INTO pickups (item_id, quantity, picked_up_by, picked_up_at, confirmation_code, confirmed_at) 
SELECT id, 50, 'Ana Anić', NOW() - INTERVAL '3 days', 'XYZ789', NOW() - INTERVAL '3 days'
FROM items WHERE code = 'WH-002';
