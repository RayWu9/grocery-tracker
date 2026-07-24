-- =====================================================
-- PricePulse — Supabase Schema
-- Run this SQL in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New Query → paste → Run)
-- =====================================================

-- Drop tables if re-running (safe for fresh setup)
DROP TABLE IF EXISTS price_snapshots CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS stores CASCADE;

-- ── Stores ──────────────────────────────────────────
CREATE TABLE stores (
  id         TEXT PRIMARY KEY,            -- e.g. 'woolworths', 'coles', 'amazon'
  name       TEXT NOT NULL,
  url        TEXT,
  color      TEXT,                        -- hex colour for charts
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO stores (id, name, url, color) VALUES
  ('woolworths',         'Woolworths',         'https://www.woolworths.com.au',         '#00a94f'),
  ('coles',              'Coles',              'https://www.coles.com.au',              '#e2001a'),
  ('amazon',             'Amazon AU',          'https://www.amazon.com.au',             '#ff9900'),
  ('chemist_warehouse',  'Chemist Warehouse',  'https://www.chemistwarehouse.com.au',  '#e30613');

-- ── Products ─────────────────────────────────────────
CREATE TABLE products (
  id            TEXT PRIMARY KEY,          -- e.g. 'coca-cola-125l'
  name          TEXT NOT NULL,
  brand         TEXT,
  size          TEXT,
  category      TEXT NOT NULL,            -- soft-drinks | confectionery | chocolate | chips | ice-cream
  emoji         TEXT,
  cycle_weeks   INTEGER,                  -- typical sale cycle length in weeks
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial products
INSERT INTO products (id, name, brand, size, category, emoji, cycle_weeks) VALUES
  ('coca-cola-125l',          'Coca-Cola',            'Coca-Cola',    '1.25L',       'soft-drinks',   '🥤', 4),
  ('pepsi-max-125l',          'Pepsi Max',             'PepsiCo',      '1.25L',       'soft-drinks',   '🥤', 4),
  ('sprite-125l',             'Sprite',                'Coca-Cola',    '1.25L',       'soft-drinks',   '🥤', 5),
  ('solo-125l',               'Solo',                  'Asahi',        '1.25L',       'soft-drinks',   '🥤', 6),
  ('mt-franklin-600ml',       'Mount Franklin',        'Coca-Cola',    '600ml',       'soft-drinks',   '💧', 5),
  ('skittles-original-160g',  'Skittles Original',     'Mars',         '160g',        'confectionery', '🌈', 6),
  ('allens-snakes-220g',      'Allen''s Snakes Alive', 'Allen''s',     '220g',        'confectionery', '🐍', 7),
  ('mentos-fruit-roll',       'Mentos Fruit Roll',     'Mentos',       '8 × 38g',     'confectionery', '🍬', 8),
  ('cadbury-dairy-milk-180g', 'Cadbury Dairy Milk',    'Cadbury',      '180g',        'chocolate',     '🍫', 6),
  ('cadbury-favourites-500g', 'Cadbury Favourites',    'Cadbury',      '500g',        'chocolate',     '🍫', 8),
  ('kitkat-chunky-4pk',       'Kit Kat Chunky',        'Nestlé',       '4-pack',      'chocolate',     '🍫', 6),
  ('lindt-excellence-85g',    'Lindt Excellence 70%',  'Lindt',        '85g',         'chocolate',     '🍫', 7),
  ('snickers-4pk',            'Snickers',              'Mars',         '4-pack 167g', 'chocolate',     '🍫', 5),
  ('pringles-original-134g',  'Pringles Original',     'Kellogg''s',   '134g',        'chips',         '🥔', 5),
  ('smiths-crinkle-150g',     'Smith''s Crinkle Cut',  'Smith''s',     '150g',        'chips',         '🥔', 4),
  ('kettle-sea-salt-150g',    'Kettle Sea Salt',       'Kettle',       '150g',        'chips',         '🥔', 6),
  ('magnum-classic-4pk',      'Magnum Classic',        'Streets',      '4-pack',      'ice-cream',     '🍦', 5),
  ('ben-jerrys-458ml',        'Ben & Jerry''s',        'Ben & Jerry''s','458ml',      'ice-cream',     '🍨', 6),
  ('streets-blue-ribbon-2l',  'Streets Blue Ribbon',   'Streets',      '2L',          'ice-cream',     '🍦', 5);

-- ── Price Snapshots ──────────────────────────────────
-- One row per product × store × week
CREATE TABLE price_snapshots (
  id            BIGSERIAL PRIMARY KEY,
  product_id    TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id      TEXT NOT NULL REFERENCES stores(id)   ON DELETE CASCADE,
  price         NUMERIC(8,2) NOT NULL,
  regular_price NUMERIC(8,2),            -- regular shelf price (null if unknown)
  on_sale       BOOLEAN DEFAULT FALSE,
  discount_pct  INTEGER,                 -- e.g. 36 for 36% off
  pack_qty      INTEGER,                 -- for Amazon multipacks (e.g. 24)
  pack_label    TEXT,                    -- e.g. '24 × 375ml'
  scraped_at    TIMESTAMPTZ DEFAULT NOW(),
  week_start    DATE NOT NULL,           -- Monday of the snapshot week

  UNIQUE (product_id, store_id, week_start)
);

-- ── Indexes ───────────────────────────────────────────
CREATE INDEX idx_snapshots_product_store ON price_snapshots(product_id, store_id);
CREATE INDEX idx_snapshots_week         ON price_snapshots(week_start DESC);
CREATE INDEX idx_snapshots_on_sale      ON price_snapshots(on_sale) WHERE on_sale = TRUE;

-- ── Row-Level Security (optional — for public read access) ──
ALTER TABLE stores         ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_snapshots ENABLE ROW LEVEL SECURITY;

-- Allow public (anonymous) reads
CREATE POLICY "Public read stores"     ON stores          FOR SELECT USING (TRUE);
CREATE POLICY "Public read products"   ON products        FOR SELECT USING (TRUE);
CREATE POLICY "Public read snapshots"  ON price_snapshots FOR SELECT USING (TRUE);

-- Only service role can write (your scraper uses the service role key)
-- (No additional policy needed — service role bypasses RLS by default)

-- ── Helper view: latest price per product per store ──
CREATE VIEW latest_prices AS
  SELECT DISTINCT ON (product_id, store_id)
    ps.*,
    p.name          AS product_name,
    p.brand,
    p.size,
    p.category,
    p.emoji,
    p.cycle_weeks,
    s.name          AS store_name,
    s.color         AS store_color
  FROM price_snapshots ps
  JOIN products p ON p.id = ps.product_id
  JOIN stores   s ON s.id = ps.store_id
  ORDER BY product_id, store_id, week_start DESC;
