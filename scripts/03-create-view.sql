-- Create computed view for live inventory calculations
-- Updated to use new column names (okov_*, ploce_*) and added latest reservation/pickup info
CREATE OR REPLACE VIEW items_computed AS
SELECT 
  i.id,
  i.code,
  i.project,
  i.name,
  i.supplier,
  i.price,
  i.input,
  i.okov_ime,
  i.okov_cena,
  i.okov_kom,
  i.ploce_ime,
  i.ploce_cena,
  i.ploce_kom,
  i.low_stock_threshold,
  i.created_at,
  i.updated_at,
  -- Calculate total output from confirmed pickups
  COALESCE(SUM(p.quantity) FILTER (WHERE p.confirmed_at IS NOT NULL), 0) as output,
  -- Calculate current stock (input - output)
  i.input - COALESCE(SUM(p.quantity) FILTER (WHERE p.confirmed_at IS NOT NULL), 0) as stock,
  -- Calculate total reserved
  COALESCE(SUM(r.quantity), 0) as reserved,
  -- Calculate available (stock - reserved)
  (i.input - COALESCE(SUM(p.quantity) FILTER (WHERE p.confirmed_at IS NOT NULL), 0)) - COALESCE(SUM(r.quantity), 0) as available,
  -- Get latest reservation info
  (SELECT reserved_by FROM reservations WHERE item_id = i.id ORDER BY reserved_at DESC LIMIT 1) as rezervisao,
  (SELECT reserved_at FROM reservations WHERE item_id = i.id ORDER BY reserved_at DESC LIMIT 1) as vreme_rezervacije,
  (SELECT reservation_code FROM reservations WHERE item_id = i.id ORDER BY reserved_at DESC LIMIT 1) as sifra_rezervacije,
  -- Get latest pickup info
  (SELECT picked_up_by FROM pickups WHERE item_id = i.id AND confirmed_at IS NOT NULL ORDER BY picked_up_at DESC LIMIT 1) as preuzeo,
  (SELECT picked_up_at FROM pickups WHERE item_id = i.id AND confirmed_at IS NOT NULL ORDER BY picked_up_at DESC LIMIT 1) as vreme_preuzimanja,
  (SELECT confirmation_code FROM pickups WHERE item_id = i.id AND confirmed_at IS NOT NULL ORDER BY picked_up_at DESC LIMIT 1) as sifra_preuzimanja
FROM items i
LEFT JOIN pickups p ON i.id = p.item_id
LEFT JOIN reservations r ON i.id = r.item_id
GROUP BY i.id, i.code, i.project, i.name, i.supplier, i.price, i.input, 
         i.okov_ime, i.okov_cena, i.okov_kom,
         i.ploce_ime, i.ploce_cena, i.ploce_kom,
         i.low_stock_threshold, i.created_at, i.updated_at;
