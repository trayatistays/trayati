-- Create destinations table for booking filter dropdown
CREATE TABLE IF NOT EXISTS destinations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to active destinations
CREATE POLICY "Public can read active destinations" ON destinations
  FOR SELECT USING (is_active = true);

-- Create policy for service role full access
CREATE POLICY "Service role full access on destinations" ON destinations
  FOR ALL USING (auth.role() = 'service_role');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS destinations_sort_order_idx ON destinations(sort_order);
CREATE INDEX IF NOT EXISTS destinations_is_active_idx ON destinations(is_active);

-- Insert default destinations from the hardcoded values
INSERT INTO destinations (id, name, is_active, sort_order) VALUES
  ('dest-uttarakhand', 'Uttarakhand', true, 0),
  ('dest-himachal-pradesh', 'Himachal Pradesh', true, 1),
  ('dest-rajasthan', 'Rajasthan', true, 2),
  ('dest-kerala', 'Kerala', true, 3)
ON CONFLICT (id) DO NOTHING;
