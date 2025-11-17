-- Create trigger to automatically set confirmed_at when confirmation_code has exactly 6 characters
CREATE OR REPLACE FUNCTION auto_confirm_pickup()
RETURNS TRIGGER AS $$
BEGIN
  IF LENGTH(NEW.confirmation_code) = 6 AND NEW.confirmed_at IS NULL THEN
    NEW.confirmed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_confirm_pickup
BEFORE INSERT OR UPDATE ON pickups
FOR EACH ROW
EXECUTE FUNCTION auto_confirm_pickup();
