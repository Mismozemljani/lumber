-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE input_history ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Only admins can insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can update users" ON users FOR UPDATE USING (true);

-- Items policies
CREATE POLICY "Everyone can read items" ON items FOR SELECT USING (true);
CREATE POLICY "Admins can insert items" ON items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update items" ON items FOR UPDATE USING (true);
CREATE POLICY "Admins can delete items" ON items FOR DELETE USING (true);

-- Reservations policies
CREATE POLICY "Everyone can read reservations" ON reservations FOR SELECT USING (true);
CREATE POLICY "Reservation users can insert reservations" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update reservations" ON reservations FOR UPDATE USING (true);
CREATE POLICY "Admins can delete reservations" ON reservations FOR DELETE USING (true);

-- Pickups policies
CREATE POLICY "Everyone can read pickups" ON pickups FOR SELECT USING (true);
CREATE POLICY "Pickup users can insert pickups" ON pickups FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update pickups" ON pickups FOR UPDATE USING (true);
CREATE POLICY "Admins can delete pickups" ON pickups FOR DELETE USING (true);

-- Input history policies
CREATE POLICY "Everyone can read input history" ON input_history FOR SELECT USING (true);
CREATE POLICY "Admins can insert input history" ON input_history FOR INSERT WITH CHECK (true);
