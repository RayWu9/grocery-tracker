/* =====================================================
   PRICEPULSE — Main Application Script
   Data + rendering + chart + modal logic
   ===================================================== */

'use strict';

// =====================================================
// SECTION 1: STORE CONFIGURATION
// =====================================================

const STORES = {
  woolworths: { name: 'Woolworths', short: 'WW', dotClass: 'dot-ww', color: '#00a94f', textColor: '#00a94f' },
  coles:      { name: 'Coles',      short: 'CO', dotClass: 'dot-co', color: '#e2001a', textColor: '#e2001a' },
  amazon:     { name: 'Amazon AU',  short: 'AM', dotClass: 'dot-am', color: '#ff9900', textColor: '#ff9900' },
};

const CATEGORIES = {
  'soft-drinks':  { label: 'Soft Drinks',   emoji: '🥤' },
  'confectionery':{ label: 'Confectionery', emoji: '🍬' },
  'chocolate':    { label: 'Chocolate',      emoji: '🍫' },
  'chips':        { label: 'Chips',          emoji: '🥔' },
  'ice-cream':    { label: 'Ice Cream',      emoji: '🍦' },
  'essentials':   { label: 'Everyday Essentials', emoji: '🍞' },
  'pantry':       { label: 'Pantry Staples',      emoji: '🥫' },
  'produce':      { label: 'Fresh Produce',      emoji: '🍎' },
  'dairy':        { label: 'Dairy & Cold',       emoji: '🥛' },
  'household':    { label: 'Household & Laundry', emoji: '🧼' },
};

// Reference date for mock data (matches "Last Updated" in the UI)
const TODAY = new Date(2026, 6, 4); // July 4 2026

// =====================================================
// SECTION 2: RAW PRODUCT DEFINITIONS
// =====================================================
// For each store: regularPrice, salePrice, phaseOffset (shifts the sale cycle)
// Amazon entries also have: packQty (units in pack), packLabel (display string)
// null means that store doesn't carry this item

const RAW_PRODUCTS = [

  // ── Soft Drinks ──
  {
    id: 'coca-cola-125l', name: 'Coca-Cola', size: '1.25L', brand: 'Coca-Cola',
    category: 'soft-drinks', emoji: '🥤', cycleWeeks: 4,
    stores: {
      woolworths: { regularPrice: 3.30, salePrice: 2.10, phaseOffset: 0 },
      coles:      { regularPrice: 3.30, salePrice: 2.10, phaseOffset: 2 },
      amazon:     { regularPrice: 58.00, salePrice: 44.00, phaseOffset: 1, packQty: 24, packLabel: '24 × 375ml' },
    }
  },
  {
    id: 'pepsi-max-125l', name: 'Pepsi Max', size: '1.25L', brand: 'PepsiCo',
    category: 'soft-drinks', emoji: '🥤', cycleWeeks: 4,
    stores: {
      woolworths: { regularPrice: 3.30, salePrice: 2.10, phaseOffset: 1 },
      coles:      { regularPrice: 3.30, salePrice: 2.10, phaseOffset: 3 },
      amazon:     { regularPrice: 55.00, salePrice: 42.00, phaseOffset: 2, packQty: 24, packLabel: '24 × 375ml' },
    }
  },
  {
    id: 'sprite-125l', name: 'Sprite', size: '1.25L', brand: 'Coca-Cola',
    category: 'soft-drinks', emoji: '🥤', cycleWeeks: 5,
    stores: {
      woolworths: { regularPrice: 3.30, salePrice: 2.10, phaseOffset: 2 },
      coles:      { regularPrice: 3.30, salePrice: 2.10, phaseOffset: 4 },
      amazon:     { regularPrice: 56.00, salePrice: 43.00, phaseOffset: 0, packQty: 24, packLabel: '24 × 375ml' },
    }
  },
  {
    id: 'solo-125l', name: 'Solo', size: '1.25L', brand: 'Asahi',
    category: 'soft-drinks', emoji: '🥤', cycleWeeks: 6,
    stores: {
      woolworths: { regularPrice: 2.80, salePrice: 1.80, phaseOffset: 0 },
      coles:      { regularPrice: 2.80, salePrice: 1.80, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'mt-franklin-600ml', name: 'Mount Franklin', size: '600ml', brand: 'Coca-Cola',
    category: 'soft-drinks', emoji: '💧', cycleWeeks: 5,
    stores: {
      woolworths: { regularPrice: 3.50, salePrice: 2.00, phaseOffset: 1 },
      coles:      { regularPrice: 3.50, salePrice: 2.00, phaseOffset: 4 },
      amazon:     { regularPrice: 48.00, salePrice: 36.00, phaseOffset: 2, packQty: 24, packLabel: '24 × 600ml' },
    }
  },

  // ── Confectionery ──
  {
    id: 'skittles-original-160g', name: 'Skittles Original', size: '160g', brand: 'Mars',
    category: 'confectionery', emoji: '🌈', cycleWeeks: 6,
    stores: {
      woolworths: { regularPrice: 4.00, salePrice: 2.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.00, salePrice: 2.50, phaseOffset: 3 },
      amazon:     { regularPrice: 35.00, salePrice: 27.00, phaseOffset: 1, packQty: 12, packLabel: '12 × 160g' },
    }
  },
  {
    id: 'allens-snakes-220g', name: "Allen's Snakes Alive", size: '220g', brand: "Allen's",
    category: 'confectionery', emoji: '🐍', cycleWeeks: 7,
    stores: {
      woolworths: { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 2 },
      coles:      { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 5 },
      amazon:     null,
    }
  },
  {
    id: 'mentos-fruit-roll', name: 'Mentos Fruit Roll', size: '8 × 38g', brand: 'Mentos',
    category: 'confectionery', emoji: '🍬', cycleWeeks: 8,
    stores: {
      woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 1 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 4 },
      amazon:     { regularPrice: 18.00, salePrice: 13.50, phaseOffset: 2, packQty: 24, packLabel: '24 × 38g' },
    }
  },

  // ── Chocolate ──
  {
    id: 'cadbury-dairy-milk-180g', name: 'Cadbury Dairy Milk', size: '180g', brand: 'Cadbury',
    category: 'chocolate', emoji: '🍫', cycleWeeks: 6,
    stores: {
      woolworths: { regularPrice: 5.00, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 5.00, salePrice: 3.50, phaseOffset: 3 },
      amazon:     { regularPrice: 52.00, salePrice: 39.00, phaseOffset: 2, packQty: 12, packLabel: '12 × 180g' },
    }
  },
  {
    id: 'cadbury-favourites-500g', name: 'Cadbury Favourites', size: '500g', brand: 'Cadbury',
    category: 'chocolate', emoji: '🍫', cycleWeeks: 8,
    stores: {
      woolworths: { regularPrice: 12.00, salePrice: 8.00, phaseOffset: 1 },
      coles:      { regularPrice: 12.00, salePrice: 8.00, phaseOffset: 5 },
      amazon:     null,
    }
  },
  {
    id: 'kitkat-chunky-4pk', name: 'Kit Kat Chunky', size: '4-pack', brand: 'Nestlé',
    category: 'chocolate', emoji: '🍫', cycleWeeks: 6,
    stores: {
      woolworths: { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 2 },
      coles:      { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 4 },
      amazon:     { regularPrice: 55.00, salePrice: 42.00, phaseOffset: 1, packQty: 12, packLabel: '12 × 4pk' },
    }
  },
  {
    id: 'lindt-excellence-85g', name: 'Lindt Excellence 70%', size: '85g', brand: 'Lindt',
    category: 'chocolate', emoji: '🍫', cycleWeeks: 7,
    stores: {
      woolworths: { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 4 },
      amazon:     { regularPrice: 42.00, salePrice: 32.00, phaseOffset: 2, packQty: 12, packLabel: '12 × 85g' },
    }
  },
  {
    id: 'snickers-4pk', name: 'Snickers', size: '4-pack 167g', brand: 'Mars',
    category: 'chocolate', emoji: '🍫', cycleWeeks: 5,
    stores: {
      woolworths: { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 1 },
      coles:      { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 3 },
      amazon:     null,
    }
  },

  // ── Chips ──
  {
    id: 'pringles-original-134g', name: 'Pringles Original', size: '134g', brand: "Kellogg's",
    category: 'chips', emoji: '🥔', cycleWeeks: 5,
    stores: {
      woolworths: { regularPrice: 4.80, salePrice: 3.00, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 3.00, phaseOffset: 2 },
      amazon:     { regularPrice: 38.00, salePrice: 28.00, phaseOffset: 3, packQty: 12, packLabel: '12 × 134g' },
    }
  },
  {
    id: 'smiths-crinkle-150g', name: "Smith's Crinkle Cut", size: '150g', brand: "Smith's",
    category: 'chips', emoji: '🥔', cycleWeeks: 4,
    stores: {
      woolworths: { regularPrice: 4.00, salePrice: 2.50, phaseOffset: 2 },
      coles:      { regularPrice: 4.00, salePrice: 2.50, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'kettle-sea-salt-150g', name: 'Kettle Sea Salt', size: '150g', brand: 'Kettle',
    category: 'chips', emoji: '🥔', cycleWeeks: 6,
    stores: {
      woolworths: { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 1 },
      coles:      { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 4 },
      amazon:     { regularPrice: 36.00, salePrice: 26.00, phaseOffset: 0, packQty: 8, packLabel: '8 × 150g' },
    }
  },

  // ── Ice Cream ──
  {
    id: 'magnum-classic-4pk', name: 'Magnum Classic', size: '4-pack', brand: 'Streets',
    category: 'ice-cream', emoji: '🍦', cycleWeeks: 5,
    stores: {
      woolworths: { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 0 },
      coles:      { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'ben-jerrys-458ml', name: "Ben & Jerry's", size: '458ml', brand: "Ben & Jerry's",
    category: 'ice-cream', emoji: '🍨', cycleWeeks: 6,
    stores: {
      woolworths: { regularPrice: 10.00, salePrice: 7.00, phaseOffset: 2 },
      coles:      { regularPrice: 10.00, salePrice: 7.00, phaseOffset: 5 },
      amazon:     null,
    }
  },
  {
    id: 'streets-blue-ribbon-2l', name: 'Streets Blue Ribbon', size: '2L', brand: 'Streets',
    category: 'ice-cream', emoji: '🍦', cycleWeeks: 5,
    stores: {
      woolworths: { regularPrice: 8.00, salePrice: 5.00, phaseOffset: 1 },
      coles:      { regularPrice: 8.00, salePrice: 5.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  
  // ── Everyday Essentials ──
  {
    id: 'woolworths-milk-2l', name: 'WW Full Cream Milk', size: '2L', brand: 'Woolworths',
    category: 'essentials', emoji: '🥛', cycleWeeks: 99,
    stores: {
      woolworths: { regularPrice: 3.10, salePrice: 3.10, phaseOffset: 0 },
      coles:      { regularPrice: 3.10, salePrice: 3.10, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'tip-top-bread-700g', name: 'Tip Top Bread', size: '700g', brand: 'Tip Top',
    category: 'essentials', emoji: '🍞', cycleWeeks: 4,
    stores: {
      woolworths: { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'western-star-butter-500g', name: 'Western Star Butter', size: '500g', brand: 'Western Star',
    category: 'essentials', emoji: '🧈', cycleWeeks: 5,
    stores: {
      woolworths: { regularPrice: 6.00, salePrice: 4.80, phaseOffset: 0 },
      coles:      { regularPrice: 6.00, salePrice: 4.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'nescafe-blend-43-150g', name: 'Nescafe Coffee', size: '150g', brand: 'Nescafe',
    category: 'essentials', emoji: '☕', cycleWeeks: 6,
    stores: {
      woolworths: { regularPrice: 11.00, salePrice: 7.00, phaseOffset: 0 },
      coles:      { regularPrice: 11.00, salePrice: 7.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'weetbix-1.2kg', name: 'Sanitarium Weet-Bix', size: '1.2kg', brand: 'Sanitarium',
    category: 'essentials', emoji: '🥣', cycleWeeks: 6,
    stores: {
      woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'quilton-toilet-paper-18pk', name: 'Quilton Toilet Paper', size: '18 Pack', brand: 'Quilton',
    category: 'essentials', emoji: '🧻', cycleWeeks: 5,
    stores: {
      woolworths: { regularPrice: 14.00, salePrice: 10.00, phaseOffset: 0 },
      coles:      { regularPrice: 14.00, salePrice: 10.00, phaseOffset: 2 },
      amazon:     null,
    }
  },

  // ── Snacks & Beverages ──
  {
    id: 'red-bull-4pk', name: 'Red Bull 4x250ml', size: '4-pack', brand: 'Red Bull',
    category: 'soft-drinks', emoji: '⚡', cycleWeeks: 5,
    stores: {
      woolworths: { regularPrice: 11.00, salePrice: 7.50, phaseOffset: 0 },
      coles:      { regularPrice: 11.00, salePrice: 7.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'doritos-cheese-170g', name: 'Doritos Cheese Supreme', size: '170g', brand: 'Doritos',
    category: 'chips', emoji: '🍿', cycleWeeks: 4,
    stores: {
      woolworths: { regularPrice: 4.80, salePrice: 2.40, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 2.40, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'thins-original-175g', name: 'Thins Chips Light & Tangy', size: '175g', brand: 'Thins',
    category: 'chips', emoji: '🥔', cycleWeeks: 4,
    stores: {
      woolworths: { regularPrice: 4.80, salePrice: 2.40, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 2.40, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'arnotts-tim-tam-200g', name: 'Arnotts Tim Tam Original', size: '200g', brand: 'Arnotts',
    category: 'chocolate', emoji: '🍪', cycleWeeks: 5,
    stores: {
      woolworths: { regularPrice: 4.50, salePrice: 2.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 2.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'twisties-cheese-90g', name: 'Twisties Cheese', size: '90g', brand: 'Twisties',
    category: 'chips', emoji: '🧀', cycleWeeks: 4,
    stores: {
      woolworths: { regularPrice: 2.70, salePrice: 1.80, phaseOffset: 0 },
      coles:      { regularPrice: 2.70, salePrice: 1.80, phaseOffset: 2 },
      amazon:     null,
    }
  },

  // ── Pantry Staples ──
  {
    id: 'san-remo-pasta-500g', name: 'San Remo Spaghetti', size: '500g', brand: 'San Remo',
    category: 'pantry', emoji: '🍝', cycleWeeks: 4,
    stores: {
      woolworths: { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 0 },
      coles:      { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'sunrice-jasmine-rice-5kg', name: 'SunRice Jasmine Rice', size: '5kg', brand: 'SunRice',
    category: 'pantry', emoji: '🌾', cycleWeeks: 6,
    stores: {
      woolworths: { regularPrice: 20.00, salePrice: 10.00, phaseOffset: 0 },
      coles:      { regularPrice: 20.00, salePrice: 10.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'cobram-estate-olive-oil-750ml', name: 'Cobram Estate Olive Oil', size: '750ml', brand: 'Cobram Estate',
    category: 'pantry', emoji: '🫒', cycleWeeks: 6,
    stores: {
      woolworths: { regularPrice: 18.00, salePrice: 12.00, phaseOffset: 0 },
      coles:      { regularPrice: 18.00, salePrice: 12.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'john-west-tuna-95g', name: 'John West Tuna', size: '95g', brand: 'John West',
    category: 'pantry', emoji: '🐟', cycleWeeks: 4,
    stores: {
      woolworths: { regularPrice: 2.70, salePrice: 1.50, phaseOffset: 0 },
      coles:      { regularPrice: 2.70, salePrice: 1.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'leggos-tomato-paste-500g', name: 'Leggos Tomato Paste', size: '500g', brand: 'Leggos',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      woolworths: { regularPrice: 4.00, salePrice: 2.80, phaseOffset: 0 },
      coles:      { regularPrice: 4.00, salePrice: 2.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  
  // ── Fresh Produce ──
  {
    id: 'cavendish-bananas-1kg', name: 'Cavendish Bananas', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍌', cycleWeeks: 99,
    stores: {
      woolworths: { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'pink-lady-apples-1kg', name: 'Pink Lady Apples', size: '1kg bag', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 5,
    stores: {
      woolworths: { regularPrice: 5.50, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 4.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'carrots-1kg', name: 'Carrots 1kg Bag', size: '1kg bag', brand: 'Fresh',
    category: 'produce', emoji: '🥕', cycleWeeks: 99,
    stores: {
      woolworths: { regularPrice: 2.50, salePrice: 2.50, phaseOffset: 0 },
      coles:      { regularPrice: 2.50, salePrice: 2.50, phaseOffset: 0 },
      amazon:     null,
    }
  },

  // ── Dairy & Cold ──
  {
    id: 'bega-cheese-block-500g', name: 'Bega Tasty Cheese Block', size: '500g', brand: 'Bega',
    category: 'dairy', emoji: '🧀', cycleWeeks: 5,
    stores: {
      woolworths: { regularPrice: 10.00, salePrice: 7.50, phaseOffset: 0 },
      coles:      { regularPrice: 10.00, salePrice: 7.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'yoplait-vanilla-yogurt-1kg', name: 'Yoplait Vanilla Yogurt', size: '1kg', brand: 'Yoplait',
    category: 'dairy', emoji: '🍨', cycleWeeks: 6,
    stores: {
      woolworths: { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'chobani-greek-yogurt-170g', name: 'Chobani Greek Yogurt', size: '170g', brand: 'Chobani',
    category: 'dairy', emoji: '🥛', cycleWeeks: 4,
    stores: {
      woolworths: { regularPrice: 2.50, salePrice: 1.80, phaseOffset: 0 },
      coles:      { regularPrice: 2.50, salePrice: 1.80, phaseOffset: 2 },
      amazon:     null,
    }
  },

  // ── Household ──
  {
    id: 'cold-power-laundry-liquid-2l', name: 'Cold Power Laundry Liquid', size: '2L', brand: 'Cold Power',
    category: 'household', emoji: '🧼', cycleWeeks: 6,
    stores: {
      woolworths: { regularPrice: 20.00, salePrice: 10.00, phaseOffset: 0 },
      coles:      { regularPrice: 20.00, salePrice: 10.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'fairy-dishwasher-tablets-44pk', name: 'Fairy Dishwasher Tablets', size: '44 Pack', brand: 'Fairy',
    category: 'household', emoji: '🍽️', cycleWeeks: 6,
    stores: {
      woolworths: { regularPrice: 42.00, salePrice: 21.00, phaseOffset: 0 },
      coles:      { regularPrice: 42.00, salePrice: 21.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'dettol-liquid-handwash-refill-500ml', name: 'Dettol Handwash Refill', size: '500ml', brand: 'Dettol',
    category: 'household', emoji: '🧴', cycleWeeks: 5,
    stores: {
      woolworths: { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 0 },
      coles:      { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 2 },
      amazon:     null,
    }
  },

  // ── Additional Drinks ──
  {
    id: 'v-energy-drink-500ml', name: 'V Green Energy Can', size: '500ml', brand: 'V Energy',
    category: 'soft-drinks', emoji: '🟢', cycleWeeks: 4,
    stores: {
      woolworths: { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'lipton-ice-tea-peach-15l', name: 'Lipton Ice Tea Peach', size: '1.5L', brand: 'Lipton',
    category: 'soft-drinks', emoji: '🍹', cycleWeeks: 5,
    stores: {
      woolworths: { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
];

// =====================================================
// SECTION 3: DATA PROCESSING HELPERS
// =====================================================

/** Generate 27 weekly price snapshots (26 weeks back + current) */
function generateHistory(regularPrice, salePrice, cycleWeeks, phaseOffset) {
  const WEEKS_BACK = 26;
  const history = [];

  for (let i = WEEKS_BACK; i >= 0; i--) {
    const date = new Date(TODAY);
    date.setDate(date.getDate() - i * 7);

    const weekNum    = WEEKS_BACK - i;
    const cyclePos   = (weekNum + phaseOffset) % cycleWeeks;
    const onSale     = cyclePos < 2; // 2-week sale windows

    history.push({
      dateObj: date,
      date:    formatDateISO(date),
      label:   formatDateLabel(date),
      price:   onSale ? salePrice : regularPrice,
      onSale,
    });
  }
  return history;
}

/** Predict the next sale date based on the most-recent sale window */
function predictNextSale(history, cycleWeeks) {
  // Walk backwards to find the earliest index in the most-recent sale window
  let saleStartIdx = null;
  let tracking = false;

  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].onSale) {
      tracking = true;
      saleStartIdx = i;
    } else if (tracking) {
      break; // crossed sale-start boundary
    }
  }

  if (saleStartIdx === null) return null;

  const saleStartDate = history[saleStartIdx].dateObj;
  const nextDate = new Date(saleStartDate);
  nextDate.setDate(nextDate.getDate() + cycleWeeks * 7);

  const msPerDay  = 1000 * 60 * 60 * 24;
  const daysUntil = Math.round((nextDate - TODAY) / msPerDay);

  return {
    date:      formatDateISO(nextDate),
    label:     formatDateLabel(nextDate),
    daysUntil: Math.max(0, daysUntil),
    currentlyOnSale: history[history.length - 1].onSale,
  };
}

/** Build fully-processed product objects from raw definitions */
function processProducts(rawList) {
  return rawList.map((raw, idx) => {
    const processedStores = {};

    for (const [key, def] of Object.entries(raw.stores)) {
      if (!def) { processedStores[key] = null; continue; }

      const history   = generateHistory(def.regularPrice, def.salePrice, raw.cycleWeeks, def.phaseOffset);
      const current   = history[history.length - 1];
      const nextSale  = predictNextSale(history, raw.cycleWeeks);
      const unitPrice = def.packQty ? roundPrice(def.regularPrice / def.packQty) : null;
      const unitSale  = def.packQty ? roundPrice(def.salePrice   / def.packQty) : null;

      processedStores[key] = {
        regularPrice: def.regularPrice,
        salePrice:    def.salePrice,
        packQty:      def.packQty  || null,
        packLabel:    def.packLabel || null,
        unitPrice,
        unitSale,
        history,
        currentPrice:       current.price,
        currentUnitPrice:   def.packQty ? roundPrice(current.price / def.packQty) : null,
        onSale:             current.onSale,
        discountPct:        current.onSale ? Math.round((1 - def.salePrice / def.regularPrice) * 100) : 0,
        nextSale,
      };
    }

    // Comparison uses single-item / per-unit price across stores for ranking
    const comparePrices = Object.entries(processedStores)
      .filter(([, s]) => s)
      .map(([key, s]) => ({ key, price: s.currentUnitPrice ?? s.currentPrice }));

    const minPrice  = Math.min(...comparePrices.map(c => c.price));
    const bestStore = comparePrices.find(c => c.price === minPrice)?.key ?? null;

    const anyOnSale = Object.values(processedStores).some(s => s?.onSale);

    // Earliest upcoming sale across all available stores
    const nextSaleList = Object.values(processedStores)
      .filter(s => s?.nextSale)
      .sort((a, b) => a.nextSale.daysUntil - b.nextSale.daysUntil);
    const earliestNextSale = nextSaleList[0]?.nextSale ?? null;

    return {
      ...raw,
      stores:          processedStores,
      bestStore,
      lowestPrice:     minPrice,
      anyOnSale,
      earliestNextSale,
      _animDelay:      idx * 30, // staggered card animation
    };
  });
}

// =====================================================
// SECTION 4: PROCESSED DATA
// =====================================================

// Global mutable products array (initially populated in init())
let products = [];

// =====================================================
// SECTION 5: APP STATE
// =====================================================

const state = {
  category:  'all',
  search:    '',
  sort:      'name',
  saleOnly:  false,
  activeChart: null, // Chart.js instance
};

// =====================================================
// SECTION 6: FILTERING & SORTING
// =====================================================

function getVisibleProducts() {
  let list = products;

  if (state.category !== 'all') {
    list = list.filter(p => p.category === state.category);
  }

  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.size.toLowerCase().includes(q)
    );
  }

  if (state.saleOnly) {
    list = list.filter(p => p.anyOnSale);
  }

  list = [...list].sort((a, b) => {
    switch (state.sort) {
      case 'price-asc':  return a.lowestPrice - b.lowestPrice;
      case 'price-desc': return b.lowestPrice - a.lowestPrice;
      case 'discount':   return Math.max(...Object.values(b.stores).filter(Boolean).map(s => s.discountPct))
                              - Math.max(...Object.values(a.stores).filter(Boolean).map(s => s.discountPct));
      case 'next-sale':  {
        const da = a.earliestNextSale?.daysUntil ?? 9999;
        const db = b.earliestNextSale?.daysUntil ?? 9999;
        return da - db;
      }
      default: return a.name.localeCompare(b.name);
    }
  });

  return list;
}

// =====================================================
// SECTION 7: RENDERING — STATS BAR
// =====================================================

function renderStats() {
  const onSaleCount = products.filter(p => p.anyOnSale).length;
  document.getElementById('statItems').textContent = products.length;
  document.getElementById('statSale').textContent  = onSaleCount;
}

// =====================================================
// SECTION 8: RENDERING — PRODUCT GRID
// =====================================================

function renderGrid() {
  const visible = getVisibleProducts();
  const grid    = document.getElementById('productGrid');
  const empty   = document.getElementById('emptyState');
  const info    = document.getElementById('resultsInfo');

  if (visible.length === 0) {
    grid.innerHTML = '';
    empty.hidden   = false;
    info.textContent = '';
    return;
  }

  empty.hidden = true;
  const cat = state.category !== 'all' ? CATEGORIES[state.category]?.label : null;
  info.textContent = `Showing ${visible.length} item${visible.length !== 1 ? 's' : ''}${cat ? ' in ' + cat : ''}`;

  grid.innerHTML = visible.map((p, i) => cardHTML(p, i)).join('');

  // Attach click events to all cards
  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
    card.style.animationDelay = card.dataset.delay + 'ms';
  });
}

function cardHTML(p, idx) {
  const storeRows = Object.entries(STORES).map(([key, store]) => {
    const s = p.stores[key];
    if (!s) return `
      <div class="store-row not-available">
        <div class="store-name-wrap">
          <span class="store-dot ${store.dotClass}"></span>
          <span class="store-name-text">${store.name}</span>
        </div>
        <span class="na-text">Not available</span>
      </div>`;

    const isBest  = p.bestStore === key;
    const isAmazon = key === 'amazon';
    const bestTag  = isBest ? '<span class="best-tag">Best</span>' : '';

    let priceHTML;
    if (isAmazon && s.packLabel) {
      const displayUnitPrice = s.currentUnitPrice;
      const displayPackPrice = s.currentPrice;
      const unitLabel = s.packLabel.split('×')[0].trim() + '× = $' + displayPackPrice.toFixed(2);
      priceHTML = `
        <div class="store-price-wrap">
          <span class="store-price ${s.onSale ? 'sale-price' : ''}">$${displayUnitPrice.toFixed(2)}/unit</span>
          ${s.onSale ? `<span class="discount-pct">-${s.discountPct}%</span>` : ''}
          ${bestTag}
        </div>
        <div><span class="pack-note">${unitLabel}</span></div>`;
    } else {
      priceHTML = `
        <div class="store-price-wrap">
          <span class="store-price ${s.onSale ? 'sale-price' : ''}">$${s.currentPrice.toFixed(2)}</span>
          ${s.onSale ? `<span class="was-price">$${s.regularPrice.toFixed(2)}</span>` : ''}
          ${s.onSale ? `<span class="discount-pct">-${s.discountPct}%</span>` : ''}
          ${bestTag}
        </div>`;
    }

    return `
      <div class="store-row ${isBest ? 'best' : ''}">
        <div class="store-name-wrap">
          <span class="store-dot ${store.dotClass}"></span>
          <span class="store-name-text">${store.name}</span>
        </div>
        ${priceHTML}
      </div>`;
  }).join('');

  // Next sale prediction text
  let nextSaleHTML = '';
  if (p.anyOnSale) {
    nextSaleHTML = `<span class="next-sale-txt"><span class="onsale">🔥 On Sale Now!</span></span>`;
  } else if (p.earliestNextSale) {
    const d = p.earliestNextSale.daysUntil;
    const cls = d <= 7 ? 'soon' : '';
    nextSaleHTML = `<span class="next-sale-txt">📅 Next sale <span class="${cls}">${d === 0 ? 'today' : d + 'd away'}</span></span>`;
  }

  return `
    <article class="product-card ${p.anyOnSale ? 'on-sale' : ''}"
             role="listitem"
             data-id="${p.id}"
             data-delay="${idx * 35}"
             tabindex="0"
             aria-label="${p.name} ${p.size} – click to view price history">
      <div class="card-head">
        <div>
          <div class="card-emoji" aria-hidden="true">${p.emoji}</div>
        </div>
        ${p.anyOnSale ? '<span class="sale-badge">On Sale</span>' : ''}
      </div>
      <div class="card-name">${p.name}</div>
      <div class="card-meta">${p.size} · ${p.brand}</div>
      <div class="card-prices">${storeRows}</div>
      <div class="card-foot">
        ${nextSaleHTML}
        <button class="view-btn" tabindex="-1" aria-hidden="true">View History →</button>
      </div>
    </article>`;
}

// =====================================================
// SECTION 9: MODAL
// =====================================================

function openModal(productId) {
  const p = products.find(x => x.id === productId);
  if (!p) return;

  const overlay = document.getElementById('modalOverlay');
  const body    = document.getElementById('modalBody');

  body.innerHTML = modalHTML(p);
  overlay.removeAttribute('aria-hidden');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Close handlers
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  document.getElementById('modalBackdrop').addEventListener('click', closeModal);

  // Keyboard close
  document.addEventListener('keydown', onEscKey);

  // Render chart after modal is visible
  setTimeout(() => renderChart(p), 50);
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', onEscKey);

  if (state.activeChart) {
    state.activeChart.destroy();
    state.activeChart = null;
  }
}

function onEscKey(e) { if (e.key === 'Escape') closeModal(); }

function modalHTML(p) {
  // Store price rows (detailed)
  const storeRowsHTML = Object.entries(STORES).map(([key, store]) => {
    const s = p.stores[key];
    if (!s) return `
      <div class="modal-store-row not-available">
        <div class="modal-store-name">
          <span class="store-dot ${store.dotClass}"></span>${store.name}
        </div>
        <span style="color:var(--text-muted)">Not available</span>
        <div></div>
      </div>`;

    const isBest  = p.bestStore === key;
    const isAmazon = key === 'amazon';
    const bestTag  = isBest ? '<span class="best-tag">✓ Best Value</span>' : '';

    let mainPrice, detailLine;
    if (isAmazon && s.packLabel) {
      mainPrice  = `$${s.currentUnitPrice.toFixed(2)}/unit`;
      detailLine = `${s.packLabel} = $${s.currentPrice.toFixed(2)} total` + (s.onSale ? ` (was $${s.unitPrice.toFixed(2)}/unit)` : '');
    } else {
      mainPrice  = `$${s.currentPrice.toFixed(2)}`;
      detailLine = s.onSale ? `Was $${s.regularPrice.toFixed(2)} · save ${s.discountPct}%` : `Regular price`;
    }

    return `
      <div class="modal-store-row ${isBest ? 'best' : ''}">
        <div class="modal-store-name">
          <span class="store-dot ${store.dotClass}"></span>${store.name}
        </div>
        <div>
          <div class="modal-price-main ${s.onSale ? 'sale-price' : ''}">${mainPrice}</div>
          <div class="modal-price-detail">${detailLine}</div>
        </div>
        <div class="modal-badge">${bestTag}${s.onSale ? '<span class="sale-badge" style="display:inline-block">SALE</span>' : ''}</div>
      </div>`;
  }).join('');

  // Stats
  const allHistoryPrices = Object.values(p.stores)
    .filter(Boolean)
    .flatMap(s => s.history.map(h => h.price));
  const minEver  = roundPrice(Math.min(...allHistoryPrices));
  const maxEver  = roundPrice(Math.max(...allHistoryPrices));
  const avgPrice = roundPrice(allHistoryPrices.reduce((a, b) => a + b, 0) / allHistoryPrices.length);
  const totalSaleWeeks = Object.values(p.stores).filter(Boolean)
    .flatMap(s => s.history).filter(h => h.onSale).length;

  // Predictions per store
  const predRowsHTML = Object.entries(STORES).map(([key, store]) => {
    const s = p.stores[key];
    if (!s) return '';

    const ns = s.nextSale;
    let predInfo;
    if (ns.currentlyOnSale) {
      predInfo = `<div class="pred-days onsale">🟢 On sale now!</div><div class="pred-days" style="margin-top:2px">Next cycle ~${ns.daysUntil}d</div>`;
    } else {
      const cls = ns.daysUntil <= 7 ? 'soon' : '';
      predInfo  = `<div class="pred-date">${ns.label}</div><div class="pred-days ${cls}">${ns.daysUntil === 0 ? 'Today' : `~${ns.daysUntil} days away`}</div>`;
    }

    return `
      <div class="prediction-row">
        <div class="pred-store">
          <span class="store-dot ${store.dotClass}"></span>${store.name}
        </div>
        <div class="pred-info">${predInfo}</div>
      </div>`;
  }).filter(Boolean).join('');

  return `
    <div class="modal-header">
      <span class="modal-product-emoji" aria-hidden="true">${p.emoji}</span>
      <h2 id="modalProductName">${p.name}</h2>
      <p class="modal-product-sub">${p.size} · ${p.brand} · ${CATEGORIES[p.category]?.label}</p>
    </div>

    <!-- Current Prices -->
    <div class="modal-section">
      <p class="modal-section-title">🏪 Current Prices</p>
      <div class="modal-store-grid">${storeRowsHTML}</div>
    </div>

    <!-- Price History Chart -->
    <div class="modal-section">
      <p class="modal-section-title">📈 Price History (6 months)</p>
      <div class="chart-container">
        <canvas id="priceHistoryChart" aria-label="Price history chart for ${p.name}"></canvas>
      </div>
      <div class="chart-legend" id="chartLegend"></div>
    </div>

    <!-- Stats -->
    <div class="modal-section">
      <p class="modal-section-title">📊 Statistics</p>
      <div class="stats-grid-modal">
        <div class="stat-mini">
          <span class="stat-mini-val" style="color:var(--sale)">$${minEver.toFixed(2)}</span>
          <span class="stat-mini-lbl">Lowest Ever</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-val" style="color:var(--danger)">$${maxEver.toFixed(2)}</span>
          <span class="stat-mini-lbl">Highest Ever</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-val">$${avgPrice.toFixed(2)}</span>
          <span class="stat-mini-lbl">6-Month Avg</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-val">${p.cycleWeeks}wk</span>
          <span class="stat-mini-lbl">Sale Cycle</span>
        </div>
      </div>
    </div>

    <!-- Sale Predictions -->
    <div class="modal-section">
      <p class="modal-section-title">🔮 Next Predicted Sale</p>
      <div class="prediction-grid">${predRowsHTML}</div>
      <div class="cycle-info" style="margin-top:12px">
        🔄 This item typically goes on sale every <strong>${p.cycleWeeks} weeks</strong> per store.
        Predictions are based on observed price patterns.
      </div>
    </div>`;
}

// =====================================================
// SECTION 10: CHART
// =====================================================

function renderChart(p) {
  const canvas = document.getElementById('priceHistoryChart');
  if (!canvas) return;

  if (state.activeChart) {
    state.activeChart.destroy();
    state.activeChart = null;
  }

  // Build datasets — use per-unit prices for Amazon for fair comparison
  const labels   = p.stores.woolworths?.history.map(h => h.label) ?? [];
  const datasets = [];

  for (const [key, store] of Object.entries(STORES)) {
    const s = p.stores[key];
    if (!s) continue;

    const isAmazon = key === 'amazon';
    const data = s.history.map(h => {
      if (isAmazon && s.packQty) return roundPrice(h.price / s.packQty);
      return h.price;
    });

    const salePointColors = s.history.map(h => h.onSale ? '#22c55e' : store.color);

    datasets.push({
      label:               store.name + (isAmazon && s.packQty ? ' (per unit)' : ''),
      data,
      borderColor:         store.color,
      backgroundColor:     store.color + '18',
      borderWidth:         2.2,
      pointRadius:         4,
      pointHoverRadius:    6,
      pointBackgroundColor: salePointColors,
      pointBorderColor:    'transparent',
      tension:             0.35,
      fill:                false,
    });
  }

  state.activeChart = new Chart(canvas, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f1628',
          borderColor:     'rgba(255,255,255,0.1)',
          borderWidth:     1,
          titleColor:      '#e2e8f4',
          bodyColor:       '#8a9bb5',
          padding:         12,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: $${ctx.parsed.y.toFixed(2)}`,
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color:       '#4e5f78',
            font:        { size: 10 },
            maxTicksLimit: 8,
            maxRotation: 0,
          },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          ticks: {
            color:    '#4e5f78',
            font:     { size: 11 },
            callback: v => '$' + v.toFixed(2),
          },
          grid: { color: 'rgba(255,255,255,0.05)' },
        }
      }
    }
  });

  // Custom legend
  const legendEl = document.getElementById('chartLegend');
  if (legendEl) {
    legendEl.innerHTML = datasets.map((ds, i) => `
      <div class="legend-item">
        <span class="legend-dot" style="background:${Object.values(STORES)[i]?.color ?? '#888'}"></span>
        <span>${ds.label}</span>
      </div>`).join('');
    legendEl.innerHTML += `
      <div class="legend-item">
        <span class="legend-dot" style="background:#22c55e"></span>
        <span>Sale price point</span>
      </div>`;
  }
}

// =====================================================
// SECTION 11: EVENT LISTENERS
// =====================================================

function initListeners() {
  // Search
  document.getElementById('searchInput').addEventListener('input', e => {
    state.search = e.target.value.trim();
    renderGrid();
  });

  // Sort
  document.getElementById('sortSelect').addEventListener('change', e => {
    state.sort = e.target.value;
    renderGrid();
  });

  // Sale-only toggle
  document.getElementById('saleToggle').addEventListener('change', e => {
    state.saleOnly = e.target.checked;
    renderGrid();
  });

  // Category tabs
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.category = btn.dataset.cat;
      renderGrid();
    });
  });

  // Keyboard navigation for product cards
  document.getElementById('productGrid').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.product-card');
      if (card) { e.preventDefault(); openModal(card.dataset.id); }
    }
  });
}

// =====================================================
// SECTION 12: UTILITY FUNCTIONS
// =====================================================

function roundPrice(n) {
  return Math.round(n * 100) / 100;
}

function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

function formatDateLabel(date) {
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

// =====================================================
// SECTION 13: INIT
// =====================================================

// =====================================================
// SECTION 14: SUPABASE CONFIGURATION & DATA PROCESSING
// =====================================================

const CREDENTIALS_KEY = 'pricepulse_supabase_creds';
let supabaseClient = null;

function getSavedCredentials() {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveCredentials(url, key) {
  try {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ url, key }));
  } catch (e) {
    console.error('Failed to save credentials to localStorage:', e);
  }
}

function clearCredentials() {
  try {
    localStorage.removeItem(CREDENTIALS_KEY);
  } catch (e) {}
}

function initSupabase(url, key) {
  if (!window.supabase) {
    throw new Error('Supabase library not loaded. Please check your network connection.');
  }
  return window.supabase.createClient(url, key);
}

async function fetchDbData(client) {
  // Query products
  const productsResponse = await client
    .from('products')
    .select('*');

  if (productsResponse.error) {
    throw new Error(`Failed to fetch products: ${productsResponse.error.message}`);
  }

  // Query snapshots (last 26 weeks)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 26 * 7);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  const snapshotsResponse = await client
    .from('price_snapshots')
    .select('*')
    .gte('week_start', cutoffStr);

  if (snapshotsResponse.error) {
    throw new Error(`Failed to fetch price snapshots: ${snapshotsResponse.error.message}`);
  }

  return {
    products: productsResponse.data,
    snapshots: snapshotsResponse.data,
  };
}

function processSupabaseData(dbProducts, dbSnapshots) {
  return dbProducts.map((p, idx) => {
    const stores = { woolworths: null, coles: null, amazon: null };
    const pSnapshots = dbSnapshots.filter(s => s.product_id === p.id);

    for (const storeId of ['woolworths', 'coles', 'amazon']) {
      const sSnaps = pSnapshots
        .filter(s => s.store_id === storeId)
        .sort((a, b) => a.week_start.localeCompare(b.week_start));

      if (sSnaps.length === 0) continue;

      const history = sSnaps.map(snap => {
        const dateObj = new Date(snap.week_start);
        return {
          dateObj,
          date:    snap.week_start,
          label:   formatDateLabel(dateObj),
          price:   parseFloat(snap.price),
          onSale:  !!snap.on_sale,
        };
      });

      const latestSnap = sSnaps[sSnaps.length - 1];
      const packQty = latestSnap.pack_qty || null;
      const packLabel = latestSnap.pack_label || null;
      const regPrice = parseFloat(latestSnap.regular_price || latestSnap.price);
      const salePrice = latestSnap.on_sale ? parseFloat(latestSnap.price) : regPrice;

      const currentUnitPrice = packQty ? roundPrice(latestSnap.price / packQty) : null;
      const unitPrice = packQty ? roundPrice(regPrice / packQty) : null;
      const unitSale = packQty ? roundPrice(salePrice / packQty) : null;

      const nextSale = predictNextSale(history, p.cycle_weeks || 4);

      stores[storeId] = {
        regularPrice: regPrice,
        salePrice:    salePrice,
        packQty,
        packLabel,
        unitPrice,
        unitSale,
        history,
        currentPrice:       parseFloat(latestSnap.price),
        currentUnitPrice:   currentUnitPrice,
        onSale:             !!latestSnap.on_sale,
        discountPct:        latestSnap.discount_pct || (latestSnap.on_sale ? Math.round((1 - salePrice / regPrice) * 100) : 0),
        nextSale,
      };
    }

    const comparePrices = Object.entries(stores)
      .filter(([, s]) => s)
      .map(([key, s]) => ({ key, price: s.currentUnitPrice ?? s.currentPrice }));

    const minPrice  = Math.min(...comparePrices.map(c => c.price));
    const bestStore = comparePrices.find(c => c.price === minPrice)?.key ?? null;

    const anyOnSale = Object.values(stores).some(s => s?.onSale);

    const nextSaleList = Object.values(stores)
      .filter(s => s?.nextSale)
      .sort((a, b) => a.nextSale.daysUntil - b.nextSale.daysUntil);
    const earliestNextSale = nextSaleList[0]?.nextSale ?? null;

    return {
      id:          p.id,
      name:        p.name,
      size:        p.size,
      brand:       p.brand,
      category:    p.category,
      emoji:       p.emoji || '🛒',
      cycleWeeks:  p.cycle_weeks || 4,
      stores,
      bestStore,
      lowestPrice:     minPrice,
      anyOnSale,
      earliestNextSale,
      _animDelay:      idx * 30,
    };
  });
}

function loadMockData() {
  products = processProducts(RAW_PRODUCTS);
  document.getElementById('statDate').textContent = formatDateLabel(TODAY) + ' ' + TODAY.getFullYear();
}

function updateSourceBadge(text, type) {
  const badge = document.getElementById('statSource');
  if (!badge) return;
  badge.textContent = text;
  badge.className = 'stat-val ' + type;
}

function setupSettingsUI() {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsOverlay = document.getElementById('settingsOverlay');
  const settingsCloseBtn = document.getElementById('settingsCloseBtn');
  const settingsBackdrop = document.getElementById('settingsBackdrop');
  const settingsForm = document.getElementById('settingsForm');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const statusBox = document.getElementById('connectionStatusBox');

  const urlInput = document.getElementById('supabaseUrlInput');
  const keyInput = document.getElementById('supabaseKeyInput');

  // Pre-fill inputs if credentials exist
  const creds = getSavedCredentials();
  if (creds) {
    urlInput.value = creds.url || '';
    keyInput.value = creds.key || '';
  }

  // Open settings modal
  settingsBtn.addEventListener('click', () => {
    settingsOverlay.removeAttribute('aria-hidden');
    settingsOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    statusBox.style.display = 'none';

    // Refresh prefill from current storage
    const currentCreds = getSavedCredentials();
    if (currentCreds) {
      urlInput.value = currentCreds.url || '';
      keyInput.value = currentCreds.key || '';
    }
  });

  // Close modal
  const closeSettings = () => {
    settingsOverlay.classList.remove('open');
    settingsOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  settingsCloseBtn.addEventListener('click', closeSettings);
  settingsBackdrop.addEventListener('click', closeSettings);

  // Disconnect button
  disconnectBtn.addEventListener('click', () => {
    clearCredentials();
    urlInput.value = '';
    keyInput.value = '';
    
    statusBox.textContent = 'Disconnected. Using mock dataset.';
    statusBox.className = 'status-msg-box info';
    statusBox.style.display = 'block';

    updateSourceBadge('Mock Data', 'mock');
    loadMockData();
    renderStats();
    renderGrid();
    
    setTimeout(closeSettings, 1000);
  });

  // Form submit (Connect & Save)
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    const key = keyInput.value.trim();

    statusBox.textContent = 'Testing connection...';
    statusBox.className = 'status-msg-box info';
    statusBox.style.display = 'block';

    try {
      const tempClient = window.supabase.createClient(url, key);
      
      // Test query: try to fetch a single store row to verify read access
      const testQuery = await tempClient.from('stores').select('id').limit(1);
      
      if (testQuery.error) {
        throw new Error(testQuery.error.message);
      }

      // Success: Save credentials and load live data
      saveCredentials(url, key);
      supabaseClient = tempClient;
      
      statusBox.textContent = 'Connection successful! Loading data...';
      statusBox.className = 'status-msg-box success';

      const dbData = await fetchDbData(supabaseClient);
      if (dbData.products && dbData.products.length > 0) {
        products = processSupabaseData(dbData.products, dbData.snapshots);
        updateSourceBadge('Supabase', 'connected');

        // Update stats dates from actual latest week_start
        if (dbData.snapshots.length > 0) {
          const dates = dbData.snapshots.map(s => s.week_start);
          const maxDate = new Date(dates.reduce((a, b) => a > b ? a : b));
          document.getElementById('statDate').textContent = formatDateLabel(maxDate) + ' ' + maxDate.getFullYear();
        }
      } else {
        throw new Error('Database contains no products.');
      }

      renderStats();
      renderGrid();

      setTimeout(closeSettings, 1200);
    } catch (err) {
      statusBox.textContent = `Connection failed: ${err.message}`;
      statusBox.className = 'status-msg-box error';
    }
  });
}

async function init() {
  initListeners();
  setupSettingsUI();

  const creds = getSavedCredentials();

  if (creds && creds.url && creds.key) {
    try {
      updateSourceBadge('Connecting...', 'info');
      supabaseClient = initSupabase(creds.url, creds.key);
      const dbData = await fetchDbData(supabaseClient);

      if (dbData.products && dbData.products.length > 0) {
        products = processSupabaseData(dbData.products, dbData.snapshots);
        updateSourceBadge('Supabase', 'connected');
        
        // Update stats dates from actual latest week_start in snapshots
        if (dbData.snapshots.length > 0) {
          const dates = dbData.snapshots.map(s => s.week_start);
          const maxDate = new Date(dates.reduce((a, b) => a > b ? a : b));
          document.getElementById('statDate').textContent = formatDateLabel(maxDate) + ' ' + maxDate.getFullYear();
        }
      } else {
        throw new Error('Supabase database contains no products.');
      }
    } catch (e) {
      console.error('Supabase load failed. Falling back to mock data.', e);
      loadMockData();
      updateSourceBadge('Mock (DB Error)', 'mock');
    }
  } else {
    loadMockData();
    updateSourceBadge('Mock Data', 'mock');
  }

  renderStats();
  renderGrid();
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
