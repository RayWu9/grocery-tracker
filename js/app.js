/* =====================================================
   PRICEPULSE — Main Application Script
   Data + rendering + chart + modal logic
   ===================================================== */

'use strict';

// =====================================================
// SECTION 1: STORE CONFIGURATION
// =====================================================

const STORES = {
  woolworths:         { name: 'Woolworths',         short: 'WW', dotClass: 'dot-ww', color: '#00c85e', textColor: '#00c85e' },
  coles:              { name: 'Coles',              short: 'CO', dotClass: 'dot-co', color: '#ff3b4e', textColor: '#ff3b4e' },
  amazon:             { name: 'Amazon AU',          short: 'AM', dotClass: 'dot-am', color: '#ffaa22', textColor: '#ffaa22' },
  chemist_warehouse:  { name: 'Chemist Warehouse',  short: 'CW', dotClass: 'dot-cw', color: '#ffe033', textColor: '#ffe033' },
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
  'bakery':       { label: 'Bakery & Bread',     emoji: '🥖' },
  'breakfast':    { label: 'Breakfast & Cereal',  emoji: '🥣' },
  'meat':         { label: 'Meat & Seafood',     emoji: '🥩' },
  'frozen':       { label: 'Frozen Foods',       emoji: '🍕' },
  'personal-care':{ label: 'Personal Care',      emoji: '🧴' },
  'baby':         { label: 'Baby Care',          emoji: '👶' },
  'pet':          { label: 'Pet Supplies',       emoji: '🐾' },
  'health':       { label: 'Health & Wellness',  emoji: '💊' },
  'baking':       { label: 'Baking & Cooking',   emoji: '🧁' },
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
  {
    id: 'coca-cola-125l', sku: '9301445677957', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101171.jpg', name: 'Coca-Cola Classic', size: '1.25L', brand: 'Coca-Cola',
    category: 'soft-drinks', emoji: '🥤', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.30, salePrice: 2.10, phaseOffset: 0 },
      coles:      { regularPrice: 3.30, salePrice: 2.10, phaseOffset: 2 },
      amazon:     { regularPrice: 63.36, salePrice: 42.84, phaseOffset: 1, packQty: 24, packLabel: '24 × 1.25L' },
    }
  },
  {
    id: 'pepsi-max-125l', sku: '9301507406307', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101221.jpg', name: 'Pepsi Max Cola No Sugar', size: '1.25L', brand: 'PepsiCo',
    category: 'soft-drinks', emoji: '🥤', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.30, salePrice: 2.10, phaseOffset: 1 },
      coles:      { regularPrice: 3.30, salePrice: 2.10, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'sprite-125l', sku: '9301195060856', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/100968.jpg', name: 'Sprite Lemonade', size: '1.25L', brand: 'Coca-Cola',
    category: 'soft-drinks', emoji: '🥤', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.30, salePrice: 2.10, phaseOffset: 2 },
      coles:      { regularPrice: 3.30, salePrice: 2.10, phaseOffset: 4 },
      amazon:     { regularPrice: 63.36, salePrice: 42.84, phaseOffset: 3, packQty: 24, packLabel: '24 × 1.25L' },
    }
  },
  {
    id: 'solo-125l', sku: '9300925925250', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/100750.jpg', name: 'Solo Original Lemon', size: '1.25L', brand: 'Asahi',
    category: 'soft-drinks', emoji: '🥤', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 1.80, phaseOffset: 0 },
      coles:      { regularPrice: 2.80, salePrice: 1.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'mt-franklin-600ml', sku: '9301895060345', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101535.jpg', name: 'Mount Franklin Sparkling', size: '600ml', brand: 'Coca-Cola',
    category: 'soft-drinks', emoji: '💧', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 2.00, phaseOffset: 1 },
      coles:      { regularPrice: 3.50, salePrice: 2.00, phaseOffset: 3 },
      amazon:     { regularPrice: 67.20, salePrice: 40.80, phaseOffset: 2, packQty: 24, packLabel: '24 × 600ml' },
    }
  },
  {
    id: 'red-bull-4pk', sku: '9301366665669', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101107.jpg', name: 'Red Bull Energy Drink', size: '4 x 250ml', brand: 'Red Bull',
    category: 'soft-drinks', emoji: '⚡', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 11.00, salePrice: 7.50, phaseOffset: 0 },
      coles:      { regularPrice: 11.00, salePrice: 7.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'v-energy-drink-500ml', sku: '9302228393435', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101805.jpg', name: 'V Green Energy Can', size: '500ml', brand: 'V Energy',
    category: 'soft-drinks', emoji: '🟢', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 2 },
      coles:      { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 0 },
      amazon:     { regularPrice: 86.40, salePrice: 61.20, phaseOffset: 3, packQty: 24, packLabel: '24 × 500ml' },
    }
  },
  {
    id: 'lipton-ice-tea-peach-15l', sku: '9302696294328', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102184.jpg', name: 'Lipton Ice Tea Peach', size: '1.5L', brand: 'Lipton',
    category: 'soft-drinks', emoji: '🍹', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 3 },
      coles:      { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'fanta-orange-125l', sku: '9301861727036', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101508.jpg', name: 'Fanta Orange', size: '1.25L', brand: 'Coca-Cola',
    category: 'soft-drinks', emoji: '🥤', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.30, salePrice: 2.10, phaseOffset: 2 },
      coles:      { regularPrice: 3.30, salePrice: 2.10, phaseOffset: 0 },
      amazon:     { regularPrice: 63.36, salePrice: 42.84, phaseOffset: 3, packQty: 24, packLabel: '24 × 1.25L' },
    }
  },
  {
    id: 'schweppes-lemonade-11l', sku: '9302606170937', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102111.jpg', name: 'Schweppes Lemonade', size: '1.1L', brand: 'Schweppes',
    category: 'soft-drinks', emoji: '🥤', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.00, salePrice: 1.80, phaseOffset: 0 },
      coles:      { regularPrice: 3.00, salePrice: 1.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'kirks-pasito-10pk', sku: '9301987652870', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101610.jpg', name: 'Kirks Pasito Cans', size: '10 x 375ml', brand: 'Kirks',
    category: 'soft-drinks', emoji: '🥤', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 10.50, salePrice: 6.50, phaseOffset: 1 },
      coles:      { regularPrice: 10.50, salePrice: 6.50, phaseOffset: 3 },
      amazon:     { regularPrice: 201.60, salePrice: 132.60, phaseOffset: 2, packQty: 24, packLabel: '24 × 10 x 375ml' },
    }
  },
  {
    id: 'gatorade-blue-bolt-1l', sku: '9302454319196', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101988.jpg', name: 'Gatorade Blue Bolt', size: '1L', brand: 'Gatorade',
    category: 'soft-drinks', emoji: '🏃', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.00, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 3.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'powerade-berry-ice-600ml', sku: '9302728393070', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102210.jpg', name: 'Powerade Berry Ice', size: '600ml', brand: 'Powerade',
    category: 'soft-drinks', emoji: '🏃', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.80, salePrice: 2.40, phaseOffset: 2 },
      coles:      { regularPrice: 3.80, salePrice: 2.40, phaseOffset: 4 },
      amazon:     { regularPrice: 72.96, salePrice: 48.96, phaseOffset: 3, packQty: 24, packLabel: '24 × 600ml' },
    }
  },
  {
    id: 'bundaberg-ginger-beer-4pk', sku: '9302955553398', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102394.jpg', name: 'Bundaberg Ginger Beer', size: '4 x 375ml', brand: 'Bundaberg',
    category: 'soft-drinks', emoji: '🍺', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 0 },
      coles:      { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'coke-zero-30pk', sku: '9301572838358', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101274.jpg', name: 'Coca-Cola Zero Sugar Cans', size: '30 x 375ml', brand: 'Coca-Cola',
    category: 'soft-drinks', emoji: '🥤', cycleWeeks: 8,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 39.00, salePrice: 26.00, phaseOffset: 4 },
      coles:      { regularPrice: 39.00, salePrice: 26.00, phaseOffset: 6 },
      amazon:     { regularPrice: 748.80, salePrice: 530.40, phaseOffset: 5, packQty: 24, packLabel: '24 × 30 x 375ml' },
    }
  },
  {
    id: 'skittles-original-160g', sku: '9302567899360', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102080.jpg', name: 'Skittles Original Fruit', size: '160g', brand: 'Mars',
    category: 'confectionery', emoji: '🌈', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.00, salePrice: 2.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.00, salePrice: 2.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'allens-snakes-220g', sku: '9302006171375', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101625.jpg', name: 'Allens Snakes Alive', size: '220g', brand: 'Allens',
    category: 'confectionery', emoji: '🐍', cycleWeeks: 7,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 2 },
      coles:      { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 4 },
      amazon:     { regularPrice: 43.20, salePrice: 30.60, phaseOffset: 3, packQty: 12, packLabel: '12 × 220g' },
    }
  },
  {
    id: 'mentos-fruit-roll', sku: '9302156788549', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101747.jpg', name: 'Mentos Fruit Roll', size: '8 x 38g', brand: 'Mentos',
    category: 'confectionery', emoji: '🍬', cycleWeeks: 8,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 1 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'allens-party-mix-190g', sku: '9302376541475', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101925.jpg', name: 'Allens Party Mix', size: '190g', brand: 'Allens',
    category: 'confectionery', emoji: '🍬', cycleWeeks: 7,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 2 },
      amazon:     { regularPrice: 43.20, salePrice: 30.60, phaseOffset: 1, packQty: 12, packLabel: '12 × 190g' },
    }
  },
  {
    id: 'starburst-snakes-170g', sku: '9302459257464', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101992.jpg', name: 'Starburst Sour Snakes', size: '170g', brand: 'Starburst',
    category: 'confectionery', emoji: '🐍', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.00, salePrice: 2.50, phaseOffset: 1 },
      coles:      { regularPrice: 4.00, salePrice: 2.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'haribo-goldbears-150g', sku: '9302369134073', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101919.jpg', name: 'Haribo Goldbears', size: '150g', brand: 'Haribo',
    category: 'confectionery', emoji: '🧸', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.80, salePrice: 2.40, phaseOffset: 0 },
      coles:      { regularPrice: 3.80, salePrice: 2.40, phaseOffset: 2 },
      amazon:     { regularPrice: 36.48, salePrice: 24.48, phaseOffset: 1, packQty: 12, packLabel: '12 × 150g' },
    }
  },
  {
    id: 'chupa-chups-10pk', sku: '9301829628294', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101482.jpg', name: 'Chupa Chups Lollipops', size: '10 Pack', brand: 'Chupa Chups',
    category: 'confectionery', emoji: '🍭', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.20, salePrice: 2.80, phaseOffset: 2 },
      coles:      { regularPrice: 4.20, salePrice: 2.80, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'natural-confectionery-snakes-260g', sku: '9303943206998', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103194.jpg', name: 'TNCC Snakes', size: '260g', brand: 'TNCC',
    category: 'confectionery', emoji: '🐍', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.00, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 5.00, salePrice: 3.50, phaseOffset: 2 },
      amazon:     { regularPrice: 48.00, salePrice: 35.70, phaseOffset: 1, packQty: 12, packLabel: '12 × 260g' },
    }
  },
  {
    id: 'pascall-marshmallows-280g', sku: '9302949380563', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102389.jpg', name: 'Pascall Vanilla Marshmallows', size: '280g', brand: 'Pascall',
    category: 'confectionery', emoji: '🍥', cycleWeeks: 7,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 3 },
      coles:      { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 5 },
      amazon:     null,
    }
  },
  {
    id: 'red-skins-allen-220g', sku: '9302193825559', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101777.jpg', name: 'Allens Red Ripperz', size: '220g', brand: 'Allens',
    category: 'confectionery', emoji: '🍬', cycleWeeks: 7,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 1 },
      coles:      { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 3 },
      amazon:     { regularPrice: 43.20, salePrice: 30.60, phaseOffset: 2, packQty: 12, packLabel: '12 × 220g' },
    }
  },
  {
    id: 'werthers-original-140g', sku: '9302566664793', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102079.jpg', name: 'Werthers Original Butter Candies', size: '140g', brand: 'Werthers',
    category: 'confectionery', emoji: '🍬', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.00, salePrice: 2.80, phaseOffset: 0 },
      coles:      { regularPrice: 4.00, salePrice: 2.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'eclipse-mints-peppermint-40g', sku: '9303365429642', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102726.jpg', name: 'Eclipse Mints Peppermint', size: '40g', brand: 'Eclipse',
    category: 'confectionery', emoji: '🍃', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 2.20, phaseOffset: 1 },
      coles:      { regularPrice: 3.50, salePrice: 2.20, phaseOffset: 3 },
      amazon:     { regularPrice: 33.60, salePrice: 22.44, phaseOffset: 2, packQty: 12, packLabel: '12 × 40g' },
    }
  },
  {
    id: 'mentos-mint-rolls-4pk', sku: '9302548146288', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102064.jpg', name: 'Mentos Mint Rolls', size: '4 x 37.5g', brand: 'Mentos',
    category: 'confectionery', emoji: '🍬', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.20, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 3.20, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'tictac-freshmint-24g', sku: '9302349381001', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101903.jpg', name: 'Tic Tac Fresh Mint', size: '24g', brand: 'Tic Tac',
    category: 'confectionery', emoji: '🍬', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.00, salePrice: 1.40, phaseOffset: 0 },
      coles:      { regularPrice: 2.00, salePrice: 1.40, phaseOffset: 2 },
      amazon:     { regularPrice: 19.20, salePrice: 14.28, phaseOffset: 1, packQty: 12, packLabel: '12 × 24g' },
    }
  },
  {
    id: 'sour-patch-kids-190g', sku: '9302227158868', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101804.jpg', name: 'Sour Patch Kids', size: '190g', brand: 'Sour Patch',
    category: 'confectionery', emoji: '👾', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 2 },
      coles:      { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'cadbury-dairy-milk-180g', sku: '9302596294401', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102103.jpg', name: 'Cadbury Dairy Milk Block', size: '180g', brand: 'Cadbury',
    category: 'chocolate', emoji: '🍫', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.00, salePrice: 3.50, phaseOffset: 2 },
      amazon:     { regularPrice: 57.60, salePrice: 35.70, phaseOffset: 1, packQty: 12, packLabel: '12 × 180g' },
    }
  },
  {
    id: 'cadbury-favourites-500g', sku: '9302696294328', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102184.jpg', name: 'Cadbury Favourites Box', size: '500g', brand: 'Cadbury',
    category: 'chocolate', emoji: '🍫', cycleWeeks: 8,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 16.00, salePrice: 8.00, phaseOffset: 1 },
      coles:      { regularPrice: 16.00, salePrice: 8.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'kitkat-chunky-4pk', sku: '9302058023189', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101667.jpg', name: 'Kit Kat Chunky Pack', size: '4 Pack', brand: 'Nestle',
    category: 'chocolate', emoji: '🍫', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 3.50, phaseOffset: 2 },
      coles:      { regularPrice: 6.00, salePrice: 3.50, phaseOffset: 4 },
      amazon:     { regularPrice: 57.60, salePrice: 35.70, phaseOffset: 3, packQty: 12, packLabel: '12 × 4 Pack' },
    }
  },
  {
    id: 'lindt-excellence-85g', sku: '9302332097063', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101889.jpg', name: 'Lindt Excellence 70% Dark', size: '85g', brand: 'Lindt',
    category: 'chocolate', emoji: '🍫', cycleWeeks: 7,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.00, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 3.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'snickers-4pk', sku: '9301459258194', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101182.jpg', name: 'Snickers Multipack', size: '4 Pack', brand: 'Mars',
    category: 'chocolate', emoji: '🍫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 3.50, phaseOffset: 1 },
      coles:      { regularPrice: 6.00, salePrice: 3.50, phaseOffset: 3 },
      amazon:     { regularPrice: 57.60, salePrice: 35.70, phaseOffset: 2, packQty: 12, packLabel: '12 × 4 Pack' },
    }
  },
  {
    id: 'arnotts-tim-tam-200g', sku: '9302240739105', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101815.jpg', name: 'Arnotts Tim Tam Original', size: '200g', brand: 'Arnotts',
    category: 'chocolate', emoji: '🍪', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 2.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 2.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'maltesers-400g', sku: '9301570369224', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101272.jpg', name: 'Maltesers Chocolate Bucket', size: '400g', brand: 'Maltesers',
    category: 'chocolate', emoji: '🔴', cycleWeeks: 8,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 12.00, salePrice: 7.00, phaseOffset: 3 },
      coles:      { regularPrice: 12.00, salePrice: 7.00, phaseOffset: 5 },
      amazon:     { regularPrice: 115.20, salePrice: 71.40, phaseOffset: 4, packQty: 12, packLabel: '12 × 400g' },
    }
  },
  {
    id: 'mms-milk-chocolate-180g', sku: '9302591356133', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102099.jpg', name: 'M&Ms Milk Chocolate Bag', size: '180g', brand: 'M&Ms',
    category: 'chocolate', emoji: '🟤', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 1 },
      coles:      { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'pods-snickers-160g', sku: '9302034566416', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101648.jpg', name: 'Pods Snickers Chocolate', size: '160g', brand: 'Mars',
    category: 'chocolate', emoji: '🍪', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 2 },
      amazon:     { regularPrice: 52.80, salePrice: 35.70, phaseOffset: 1, packQty: 12, packLabel: '12 × 160g' },
    }
  },
  {
    id: 'mars-bar-53g', sku: '9301285184247', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101041.jpg', name: 'Mars Bar Single', size: '53g', brand: 'Mars',
    category: 'chocolate', emoji: '🍫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.50, salePrice: 1.50, phaseOffset: 0 },
      coles:      { regularPrice: 2.50, salePrice: 1.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'cherry-ripe-double-dipped-block', sku: '9303769133051', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103053.jpg', name: 'Cadbury Cherry Ripe Block', size: '180g', brand: 'Cadbury',
    category: 'chocolate', emoji: '🍫', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 3.50, phaseOffset: 4 },
      coles:      { regularPrice: 6.00, salePrice: 3.50, phaseOffset: 0 },
      amazon:     { regularPrice: 57.60, salePrice: 35.70, phaseOffset: 5, packQty: 12, packLabel: '12 × 180g' },
    }
  },
  {
    id: 'toblerone-milk-360g', sku: '9302154319415', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101745.jpg', name: 'Toblerone Milk Chocolate', size: '360g', brand: 'Toblerone',
    category: 'chocolate', emoji: '🔺', cycleWeeks: 8,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 12.00, salePrice: 7.00, phaseOffset: 0 },
      coles:      { regularPrice: 12.00, salePrice: 7.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'ferrero-rocher-16pk', sku: '9302237035404', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101812.jpg', name: 'Ferrero Rocher Gift Box', size: '16 Pack', brand: 'Ferrero',
    category: 'chocolate', emoji: '🟡', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 15.00, salePrice: 10.00, phaseOffset: 2 },
      coles:      { regularPrice: 15.00, salePrice: 10.00, phaseOffset: 4 },
      amazon:     { regularPrice: 144.00, salePrice: 102.00, phaseOffset: 3, packQty: 12, packLabel: '12 × 16 Pack' },
    }
  },
  {
    id: 'twirl-cadbury-5pk', sku: '9302061726890', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101670.jpg', name: 'Cadbury Twirl Multipack', size: '5 Pack', brand: 'Cadbury',
    category: 'chocolate', emoji: '🍫', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 3.50, phaseOffset: 1 },
      coles:      { regularPrice: 6.00, salePrice: 3.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'picnic-bar-4pk', sku: '9301604937100', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101300.jpg', name: 'Cadbury Picnic Multipack', size: '4 Pack', brand: 'Cadbury',
    category: 'chocolate', emoji: '🍫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.00, salePrice: 3.50, phaseOffset: 2 },
      amazon:     { regularPrice: 57.60, salePrice: 35.70, phaseOffset: 1, packQty: 12, packLabel: '12 × 4 Pack' },
    }
  },
  {
    id: 'pringles-original-134g', sku: '9302550615422', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102066.jpg', name: 'Pringles Original', size: '134g', brand: 'Pringles',
    category: 'chips', emoji: '🥔', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.00, salePrice: 3.20, phaseOffset: 0 },
      coles:      { regularPrice: 5.00, salePrice: 3.20, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'smiths-crinkle-150g', sku: '9302161726817', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101751.jpg', name: 'Smiths Crinkle Cut Potato', size: '150g', brand: 'Smiths',
    category: 'chips', emoji: '🥔', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 2.40, phaseOffset: 2 },
      coles:      { regularPrice: 4.80, salePrice: 2.40, phaseOffset: 0 },
      amazon:     { regularPrice: 46.08, salePrice: 24.48, phaseOffset: 3, packQty: 12, packLabel: '12 × 150g' },
    }
  },
  {
    id: 'kettle-sea-salt-150g', sku: '9302204936662', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101786.jpg', name: 'Kettle Sea Salt Chips', size: '150g', brand: 'Kettle',
    category: 'chips', emoji: '🥔', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 1 },
      coles:      { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'doritos-cheese-170g', sku: '9302145677446', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101738.jpg', name: 'Doritos Cheese Supreme', size: '170g', brand: 'Doritos',
    category: 'chips', emoji: '🍿', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 2.40, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 2.40, phaseOffset: 2 },
      amazon:     { regularPrice: 46.08, salePrice: 24.48, phaseOffset: 1, packQty: 12, packLabel: '12 × 170g' },
    }
  },
  {
    id: 'thins-original-175g', sku: '9302164195951', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101753.jpg', name: 'Thins Chips Light & Tangy', size: '175g', brand: 'Thins',
    category: 'chips', emoji: '🥔', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 2.40, phaseOffset: 1 },
      coles:      { regularPrice: 4.80, salePrice: 2.40, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'twisties-cheese-90g', sku: '9302235800837', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101811.jpg', name: 'Twisties Cheese', size: '90g', brand: 'Twisties',
    category: 'chips', emoji: '🧀', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.70, salePrice: 1.80, phaseOffset: 2 },
      coles:      { regularPrice: 2.70, salePrice: 1.80, phaseOffset: 0 },
      amazon:     { regularPrice: 25.92, salePrice: 18.36, phaseOffset: 3, packQty: 12, packLabel: '12 × 90g' },
    }
  },
  {
    id: 'red-rock-deli-sea-salt-165g', sku: '9302954318831', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102393.jpg', name: 'Red Rock Deli Sea Salt', size: '165g', brand: 'Red Rock Deli',
    category: 'chips', emoji: '🥔', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 4.00, phaseOffset: 3 },
      coles:      { regularPrice: 6.00, salePrice: 4.00, phaseOffset: 5 },
      amazon:     null,
    }
  },
  {
    id: 'cheezels-cheese-box-125g', sku: '9302704936297', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102191.jpg', name: 'Cheezels Cheese Snacks Box', size: '125g', brand: 'Cheezels',
    category: 'chips', emoji: '⭕', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 2.20, phaseOffset: 0 },
      coles:      { regularPrice: 3.50, salePrice: 2.20, phaseOffset: 2 },
      amazon:     { regularPrice: 33.60, salePrice: 22.44, phaseOffset: 1, packQty: 12, packLabel: '12 × 125g' },
    }
  },
  {
    id: 'shapes-bbq-arnotts-175g', sku: '9302625924009', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102127.jpg', name: 'Arnotts Shapes BBQ', size: '175g', brand: 'Arnotts',
    category: 'chips', emoji: '🍘', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 2.50, phaseOffset: 1 },
      coles:      { regularPrice: 4.50, salePrice: 2.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'grainwaves-sour-cream-170g', sku: '9303019750882', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102446.jpg', name: 'Grainwaves Sour Cream & Chives', size: '170g', brand: 'Grainwaves',
    category: 'chips', emoji: '🌊', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 2.40, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 2.40, phaseOffset: 2 },
      amazon:     { regularPrice: 46.08, salePrice: 24.48, phaseOffset: 1, packQty: 12, packLabel: '12 × 170g' },
    }
  },
  {
    id: 'smiths-thinly-cut-175g', sku: '9302537035185', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102055.jpg', name: 'Smiths Thinly Cut Sour Cream', size: '175g', brand: 'Smiths',
    category: 'chips', emoji: '🥔', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 2.40, phaseOffset: 3 },
      coles:      { regularPrice: 4.80, salePrice: 2.40, phaseOffset: 1 },
      amazon:     null,
    }
  },
  {
    id: 'cc-tasty-cheese-175g', sku: '9302196294693', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101779.jpg', name: 'CCs Tasty Cheese Corn Chips', size: '175g', brand: 'CCs',
    category: 'chips', emoji: '🍿', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 2.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 2.50, phaseOffset: 2 },
      amazon:     { regularPrice: 43.20, salePrice: 25.50, phaseOffset: 1, packQty: 12, packLabel: '12 × 175g' },
    }
  },
  {
    id: 'red-rock-honey-soy-165g', sku: '9302566664793', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102079.jpg', name: 'Red Rock Deli Honey Soy Chicken', size: '165g', brand: 'Red Rock Deli',
    category: 'chips', emoji: '🍗', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 4.00, phaseOffset: 2 },
      coles:      { regularPrice: 6.00, salePrice: 4.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'vege-chips-natural-100g', sku: '9302592590700', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102100.jpg', name: 'Vege Chips Natural Flavor', size: '100g', brand: 'Vege Chips',
    category: 'chips', emoji: '🌿', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.20, salePrice: 2.80, phaseOffset: 1 },
      coles:      { regularPrice: 4.20, salePrice: 2.80, phaseOffset: 3 },
      amazon:     { regularPrice: 40.32, salePrice: 28.56, phaseOffset: 2, packQty: 12, packLabel: '12 × 100g' },
    }
  },
  {
    id: 'infuzions-vege-straws-110g', sku: '9303061726160', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102480.jpg', name: 'Infuzions Veggie Straws Sour Cream', size: '110g', brand: 'Infuzions',
    category: 'chips', emoji: '🍟', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 2.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 2.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'magnum-classic-4pk', sku: '9302153084848', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101744.jpg', name: 'Magnum Classic Chocolate Sticks', size: '4 Pack', brand: 'Streets',
    category: 'ice-cream', emoji: '🍦', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 10.50, salePrice: 6.00, phaseOffset: 0 },
      coles:      { regularPrice: 10.50, salePrice: 6.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'ben-jerrys-458ml', sku: '9301787653016', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101448.jpg', name: 'Ben & Jerry Half Baked Tub', size: '458ml', brand: 'Ben & Jerry',
    category: 'ice-cream', emoji: '🍨', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 13.00, salePrice: 9.00, phaseOffset: 2 },
      coles:      { regularPrice: 13.00, salePrice: 9.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'streets-blue-ribbon-2l', sku: '9302630862277', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102131.jpg', name: 'Streets Blue Ribbon Vanilla', size: '2L', brand: 'Streets',
    category: 'ice-cream', emoji: '🍦', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.00, salePrice: 6.00, phaseOffset: 1 },
      coles:      { regularPrice: 9.00, salePrice: 6.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'connoisseur-vanilla-1l', sku: '9302713578266', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102198.jpg', name: 'Connoisseur Classic Vanilla', size: '1L', brand: 'Connoisseur',
    category: 'ice-cream', emoji: '🍨', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 12.00, salePrice: 8.00, phaseOffset: 0 },
      coles:      { regularPrice: 12.00, salePrice: 8.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'bull-creamy-classics-2l', sku: '9302738269606', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102218.jpg', name: 'Bulla Creamy Classics Vanilla', size: '2L', brand: 'Bulla',
    category: 'ice-cream', emoji: '🍨', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.50, salePrice: 6.00, phaseOffset: 3 },
      coles:      { regularPrice: 9.50, salePrice: 6.00, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'peters-original-vanilla-4l', sku: '9303148145850', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102550.jpg', name: 'Peters Original Vanilla Tub', size: '4L', brand: 'Peters',
    category: 'ice-cream', emoji: '🍨', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 10.50, salePrice: 7.50, phaseOffset: 0 },
      coles:      { regularPrice: 10.50, salePrice: 7.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'drumstick-vanilla-4pk', sku: '9302575306762', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102086.jpg', name: 'Peters Drumstick Vanilla Cone', size: '4 Pack', brand: 'Peters',
    category: 'ice-cream', emoji: '🍦', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.50, salePrice: 6.00, phaseOffset: 2 },
      coles:      { regularPrice: 9.50, salePrice: 6.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'maxibon-original-4pk', sku: '9302424689588', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101964.jpg', name: 'Peters Maxibon Vanilla Sticks', size: '4 Pack', brand: 'Peters',
    category: 'ice-cream', emoji: '🥪', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 10.00, salePrice: 6.00, phaseOffset: 4 },
      coles:      { regularPrice: 10.00, salePrice: 6.00, phaseOffset: 1 },
      amazon:     null,
    }
  },
  {
    id: 'cornetto-classic-4pk', sku: '9302440738959', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101977.jpg', name: 'Streets Cornetto Chocolate Cone', size: '4 Pack', brand: 'Streets',
    category: 'ice-cream', emoji: '🍦', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.00, salePrice: 5.00, phaseOffset: 1 },
      coles:      { regularPrice: 9.00, salePrice: 5.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'weis-mango-bar-4pk', sku: '9302080245395', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101685.jpg', name: 'Weis Mango Ice Cream Bars', size: '4 Pack', brand: 'Weis',
    category: 'ice-cream', emoji: '🥭', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 8.50, salePrice: 5.50, phaseOffset: 0 },
      coles:      { regularPrice: 8.50, salePrice: 5.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'golden-gaytime-4pk', sku: '9302155553982', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101746.jpg', name: 'Streets Golden Gaytime Sticks', size: '4 Pack', brand: 'Streets',
    category: 'ice-cream', emoji: '🍪', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 10.50, salePrice: 6.00, phaseOffset: 3 },
      coles:      { regularPrice: 10.50, salePrice: 6.00, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'paddle-pop-rainbow-8pk', sku: '9302613578339', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102117.jpg', name: 'Streets Paddle Pop Rainbow', size: '8 Pack', brand: 'Streets',
    category: 'ice-cream', emoji: '🌈', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 8.50, salePrice: 5.00, phaseOffset: 1 },
      coles:      { regularPrice: 8.50, salePrice: 5.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'hagan-dazs-macadamia-460ml', sku: '9302914812687', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102361.jpg', name: 'Haagen-Dazs Macadamia Nut', size: '460ml', brand: 'Haagen-Dazs',
    category: 'ice-cream', emoji: '🍨', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 13.00, salePrice: 9.00, phaseOffset: 0 },
      coles:      { regularPrice: 13.00, salePrice: 9.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'streets-splices-pine-lime-8pk', sku: '9303504935713', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102839.jpg', name: 'Streets Splice Pine Lime', size: '8 Pack', brand: 'Streets',
    category: 'ice-cream', emoji: '🍍', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 8.50, salePrice: 5.00, phaseOffset: 2 },
      coles:      { regularPrice: 8.50, salePrice: 5.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'monaco-bar-ice-cream-4pk', sku: '9302743207874', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102222.jpg', name: 'Peters Monaco Bar Ice Cream Sandwich', size: '4 Pack', brand: 'Peters',
    category: 'ice-cream', emoji: '🥪', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.50, salePrice: 6.00, phaseOffset: 0 },
      coles:      { regularPrice: 9.50, salePrice: 6.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'woolworths-milk-2l', sku: '9302228393435', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101805.jpg', name: 'WW Full Cream Milk', size: '2L', brand: 'Woolworths',
    category: 'essentials', emoji: '🥛', cycleWeeks: 99,
    stores: {
      chemist_warehouse: { regularPrice: 2.85, salePrice: 1.85, phaseOffset: 1 },
woolworths: { regularPrice: 3.10, salePrice: 3.10, phaseOffset: 0 },
      coles:      { regularPrice: 3.10, salePrice: 3.10, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'tip-top-bread-700g', sku: '9301939504757', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101571.jpg', name: 'Tip Top Bread Toast Slices', size: '700g', brand: 'Tip Top',
    category: 'essentials', emoji: '🍞', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 4.14, salePrice: 2.69, phaseOffset: 1 },
woolworths: { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'western-star-butter-500g', sku: '9302798763389', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102267.jpg', name: 'Western Star Butter Salted block', size: '500g', brand: 'Western Star',
    category: 'essentials', emoji: '🧈', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.52, salePrice: 3.59, phaseOffset: 1 },
woolworths: { regularPrice: 6.00, salePrice: 4.80, phaseOffset: 0 },
      coles:      { regularPrice: 6.00, salePrice: 4.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'nescafe-blend-43-150g', sku: '9302139504611', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101733.jpg', name: 'Nescafe Blend 43 Instant Coffee', size: '150g', brand: 'Nescafe',
    category: 'essentials', emoji: '☕', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 10.12, salePrice: 6.58, phaseOffset: 1 },
woolworths: { regularPrice: 11.00, salePrice: 7.00, phaseOffset: 0 },
      coles:      { regularPrice: 11.00, salePrice: 7.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'weetbix-1.2kg', sku: '9301432097720', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101160.jpg', name: 'Sanitarium Weet-Bix', size: '1.2kg', brand: 'Sanitarium',
    category: 'essentials', emoji: '🥣', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 5.98, salePrice: 3.89, phaseOffset: 1 },
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'quilton-toilet-paper-18pk', sku: '9303002466944', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102432.jpg', name: 'Quilton Toilet Paper 3ply', size: '18 Pack', brand: 'Quilton',
    category: 'essentials', emoji: '🧻', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 12.88, salePrice: 8.37, phaseOffset: 1 },
woolworths: { regularPrice: 14.00, salePrice: 10.00, phaseOffset: 0 },
      coles:      { regularPrice: 14.00, salePrice: 10.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'dairy-farmers-milk-3l', sku: '9302483948804', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102012.jpg', name: 'Dairy Farmers Full Cream Milk', size: '3L', brand: 'Dairy Farmers',
    category: 'essentials', emoji: '🥛', cycleWeeks: 99,
    stores: {
      chemist_warehouse: { regularPrice: 5.06, salePrice: 3.29, phaseOffset: 1 },
woolworths: { regularPrice: 5.50, salePrice: 5.50, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 5.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'wonder-white-bread-700g', sku: '9302591356133', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102099.jpg', name: 'Wonder White Sliced Bread Sandwich', size: '700g', brand: 'Wonder White',
    category: 'essentials', emoji: '🍞', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 4.23, salePrice: 2.75, phaseOffset: 1 },
woolworths: { regularPrice: 4.60, salePrice: 3.20, phaseOffset: 1 },
      coles:      { regularPrice: 4.60, salePrice: 3.20, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'devondale-butter-500g', sku: '9302407405650', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101950.jpg', name: 'Devondale Salted Butter Block', size: '500g', brand: 'Devondale',
    category: 'essentials', emoji: '🧈', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.52, salePrice: 3.59, phaseOffset: 1 },
woolworths: { regularPrice: 6.00, salePrice: 4.80, phaseOffset: 1 },
      coles:      { regularPrice: 6.00, salePrice: 4.80, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'dilmah-tea-bags-100pk', sku: '9302282714383', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101849.jpg', name: 'Dilmah Premium Tea Bags', size: '100 Pack', brand: 'Dilmah',
    category: 'essentials', emoji: '🍵', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 5.98, salePrice: 3.89, phaseOffset: 1 },
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 2 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'lipton-tea-bags-100pk', sku: '9302330862496', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101888.jpg', name: 'Lipton Quality Black Tea Bags', size: '100 Pack', brand: 'Lipton',
    category: 'essentials', emoji: '🍵', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.52, salePrice: 3.59, phaseOffset: 1 },
woolworths: { regularPrice: 6.00, salePrice: 3.80, phaseOffset: 0 },
      coles:      { regularPrice: 6.00, salePrice: 3.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'moccona-medium-roast-200g', sku: '9302856788038', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102314.jpg', name: 'Moccona Classic Medium Coffee Jar', size: '200g', brand: 'Moccona',
    category: 'essentials', emoji: '☕', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 18.40, salePrice: 11.96, phaseOffset: 1 },
woolworths: { regularPrice: 20.00, salePrice: 12.00, phaseOffset: 3 },
      coles:      { regularPrice: 20.00, salePrice: 12.00, phaseOffset: 5 },
      amazon:     null,
    }
  },
  {
    id: 'uncle-tobys-rolled-oats-1kg', sku: '9303229627272', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102616.jpg', name: 'Uncle Tobys Rolled Oats Bag', size: '1kg', brand: 'Uncle Tobys',
    category: 'essentials', emoji: '🥣', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 5.98, salePrice: 3.89, phaseOffset: 1 },
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 1 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'sorbent-toilet-paper-24pk', sku: '9302980244738', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102414.jpg', name: 'Sorbent Toilet Paper Silky White', size: '24 Pack', brand: 'Sorbent',
    category: 'essentials', emoji: '🧻', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 16.10, salePrice: 10.47, phaseOffset: 1 },
woolworths: { regularPrice: 17.50, salePrice: 12.00, phaseOffset: 3 },
      coles:      { regularPrice: 17.50, salePrice: 12.00, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'coles-milk-2l', sku: '9301495060637', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101211.jpg', name: 'Coles Full Cream Milk', size: '2L', brand: 'Coles',
    category: 'essentials', emoji: '🥛', cycleWeeks: 99,
    stores: {
      chemist_warehouse: { regularPrice: 2.85, salePrice: 1.85, phaseOffset: 1 },
woolworths: { regularPrice: 3.10, salePrice: 3.10, phaseOffset: 0 },
      coles:      { regularPrice: 3.10, salePrice: 3.10, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'san-remo-pasta-500g', sku: '9302075307127', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101681.jpg', name: 'San Remo Spaghetti Pasta', size: '500g', brand: 'San Remo',
    category: 'pantry', emoji: '🍝', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 0 },
      coles:      { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'sunrice-jasmine-rice-5kg', sku: '9302865430007', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102321.jpg', name: 'SunRice Jasmine Rice Bag', size: '5kg', brand: 'SunRice',
    category: 'pantry', emoji: '🌾', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 20.00, salePrice: 10.00, phaseOffset: 0 },
      coles:      { regularPrice: 20.00, salePrice: 10.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'cobram-estate-olive-oil-750ml', sku: '9303325923498', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102694.jpg', name: 'Cobram Estate EV Olive Oil', size: '750ml', brand: 'Cobram Estate',
    category: 'pantry', emoji: '🫒', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 18.00, salePrice: 12.00, phaseOffset: 0 },
      coles:      { regularPrice: 18.00, salePrice: 12.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'john-west-tuna-95g', sku: '9302061726890', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101670.jpg', name: 'John West Tuna Tempters Olive Oil', size: '95g', brand: 'John West',
    category: 'pantry', emoji: '🐟', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.70, salePrice: 1.50, phaseOffset: 0 },
      coles:      { regularPrice: 2.70, salePrice: 1.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'leggos-tomato-paste-500g', sku: '9302751849843', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102229.jpg', name: 'Leggos Tomato Paste Tub', size: '500g', brand: 'Leggos',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.00, salePrice: 2.80, phaseOffset: 0 },
      coles:      { regularPrice: 4.00, salePrice: 2.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'bega-peanut-butter-375g', sku: '9302606170937', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102111.jpg', name: 'Bega Peanut Butter Crunchy', size: '375g', brand: 'Bega',
    category: 'pantry', emoji: '🥜', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 2 },
      coles:      { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'vegemite-220g', sku: '9301419752050', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101150.jpg', name: 'Vegemite Yeast Extract Jar', size: '220g', brand: 'Vegemite',
    category: 'pantry', emoji: '🍞', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.20, salePrice: 4.20, phaseOffset: 0 },
      coles:      { regularPrice: 5.20, salePrice: 4.20, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'spaghetti-pasta-san-remo-fettuccine', sku: '9304332095603', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103509.jpg', name: 'San Remo Fettuccine Pasta No 34', size: '500g', brand: 'San Remo',
    category: 'pantry', emoji: '🍝', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 1 },
      coles:      { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'heinz-baked-beans-3pk', sku: '9302433331557', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101971.jpg', name: 'Heinz Baked Beans English Recipe', size: '3 x 220g', brand: 'Heinz',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'campbells-tomato-soup-400g', sku: '9303022220016', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102448.jpg', name: 'Campbells Condensed Tomato Soup', size: '400g', brand: 'Campbells',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.00, salePrice: 2.00, phaseOffset: 0 },
      coles:      { regularPrice: 3.00, salePrice: 2.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'glen-20-disinfectant-spray-300g', sku: '9303438269095', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102785.jpg', name: 'Glen 20 Disinfectant Lavender', size: '300g', brand: 'Glen 20',
    category: 'pantry', emoji: '💨', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.50, salePrice: 5.00, phaseOffset: 1 },
      coles:      { regularPrice: 9.50, salePrice: 5.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'heinz-tomato-ketchup-500ml', sku: '9303035800253', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102459.jpg', name: 'Heinz Tomato Ketchup Squeeze', size: '500ml', brand: 'Heinz',
    category: 'pantry', emoji: '🍅', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.20, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 5.20, salePrice: 3.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'masterfoods-tomato-sauce-500ml', sku: '9303556787527', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102881.jpg', name: 'MasterFoods Tomato Sauce Squeeze', size: '500ml', brand: 'MasterFoods',
    category: 'pantry', emoji: '🍅', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.20, salePrice: 2.80, phaseOffset: 2 },
      coles:      { regularPrice: 4.20, salePrice: 2.80, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'spam-luncheon-meat-340g', sku: '9302598763535', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102105.jpg', name: 'SPAM Luncheon Meat Can', size: '340g', brand: 'SPAM',
    category: 'pantry', emoji: '🥫', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'spc-sliced-peaches-410g', sku: '9302555553690', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102070.jpg', name: 'SPC Sliced Peaches in Juice', size: '410g', brand: 'SPC',
    category: 'pantry', emoji: '🍑', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 1 },
      coles:      { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'cavendish-bananas-1kg', sku: '9302496294474', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102022.jpg', name: 'Cavendish Bananas Fresh', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍌', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'pink-lady-apples-1kg', sku: '9302344442733', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101899.jpg', name: 'Pink Lady Apples Pack', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 4.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'carrots-1kg', sku: '9301320986690', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101070.jpg', name: 'Carrots Orange Bag', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🥕', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.50, salePrice: 2.50, phaseOffset: 0 },
      coles:      { regularPrice: 2.50, salePrice: 2.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'avocado-hass-each', sku: '9302043208385', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101655.jpg', name: 'Hass Avocado Single', size: 'Each', brand: 'Fresh',
    category: 'produce', emoji: '🥑', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.50, salePrice: 1.50, phaseOffset: 0 },
      coles:      { regularPrice: 2.50, salePrice: 1.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'brown-onions-1kg', sku: '9301929628221', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101563.jpg', name: 'Brown Onions Fresh Bag', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🧅', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.00, salePrice: 3.00, phaseOffset: 0 },
      coles:      { regularPrice: 3.00, salePrice: 3.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'potatoes-brushed-2kg', sku: '9302441973526', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101978.jpg', name: 'Brushed Potatoes bag', size: '2kg', brand: 'Fresh',
    category: 'produce', emoji: '🥔', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.00, salePrice: 4.00, phaseOffset: 0 },
      coles:      { regularPrice: 5.00, salePrice: 4.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'broccoli-fresh-each', sku: '9302311109424', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101872.jpg', name: 'Broccoli Premium Head', size: 'Each', brand: 'Fresh',
    category: 'produce', emoji: '🥦', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 1.80, phaseOffset: 1 },
      coles:      { regularPrice: 2.80, salePrice: 1.80, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'red-seedless-grapes-500g', sku: '9302716047400', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102200.jpg', name: 'Red Seedless Grapes Punnet', size: '500g', brand: 'Fresh',
    category: 'produce', emoji: '🍇', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'navel-oranges-1kg', sku: '9302017282478', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101634.jpg', name: 'Navel Oranges Bag', size: '1.5kg', brand: 'Fresh',
    category: 'produce', emoji: '🍊', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 2 },
      coles:      { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'punnet-strawberries-250g', sku: '9302862960873', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102319.jpg', name: 'Strawberries Sweet Punnet', size: '250g', brand: 'Fresh',
    category: 'produce', emoji: '🍓', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 2.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 2.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'cherry-tomatoes-250g', sku: '9302312343991', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101873.jpg', name: 'Cherry Tomatoes Punnet', size: '250g', brand: 'Fresh',
    category: 'produce', emoji: '🍅', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 1 },
      coles:      { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'baby-spinach-leaves-120g', sku: '9302692590627', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102181.jpg', name: 'Baby Spinach Leaves Tub', size: '120g', brand: 'Fresh',
    category: 'produce', emoji: '🥬', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 2.80, phaseOffset: 0 },
      coles:      { regularPrice: 3.50, salePrice: 2.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'iceberg-lettuce-each', sku: '9302432096990', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101970.jpg', name: 'Iceberg Lettuce Head', size: 'Each', brand: 'Fresh',
    category: 'produce', emoji: '🥬', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 0 },
      coles:      { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'continental-cucumber-each', sku: '9303120985376', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102528.jpg', name: 'Continental Cucumber Fresh', size: 'Each', brand: 'Fresh',
    category: 'produce', emoji: '🥒', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.50, salePrice: 1.80, phaseOffset: 0 },
      coles:      { regularPrice: 2.50, salePrice: 1.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'red-capsicum-each', sku: '9302048146653', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101659.jpg', name: 'Red Capsicum Fresh Single', size: 'Each', brand: 'Fresh',
    category: 'produce', emoji: '🫑', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 2.00, phaseOffset: 1 },
      coles:      { regularPrice: 3.50, salePrice: 2.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'bega-cheese-block-500g', sku: '9302382714310', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101930.jpg', name: 'Bega Tasty Cheese Block', size: '500g', brand: 'Bega',
    category: 'dairy', emoji: '🧀', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 10.00, salePrice: 7.50, phaseOffset: 0 },
      coles:      { regularPrice: 10.00, salePrice: 7.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'yoplait-vanilla-yogurt-1kg', sku: '9303196293963', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102589.jpg', name: 'Yoplait Vanilla Yogurt Tub', size: '1kg', brand: 'Yoplait',
    category: 'dairy', emoji: '🍨', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'chobani-greek-yogurt-170g', sku: '9302866664574', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102322.jpg', name: 'Chobani Greek Yogurt Blueberry', size: '170g', brand: 'Chobani',
    category: 'dairy', emoji: '🥛', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.50, salePrice: 1.80, phaseOffset: 0 },
      coles:      { regularPrice: 2.50, salePrice: 1.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'coon-tasty-cheese-block-500g', sku: '9303175306324', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102572.jpg', name: 'Cheer Tasty Cheese Block', size: '500g', brand: 'Cheer',
    category: 'dairy', emoji: '🧀', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 10.00, salePrice: 7.50, phaseOffset: 1 },
      coles:      { regularPrice: 10.00, salePrice: 7.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'philadelphia-cream-cheese-250g', sku: '9303435799961', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102783.jpg', name: 'Philadelphia Cream Cheese Spread', size: '250g', brand: 'Philadelphia',
    category: 'dairy', emoji: '🧀', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.20, salePrice: 3.80, phaseOffset: 0 },
      coles:      { regularPrice: 5.20, salePrice: 3.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'dairy-farmers-sour-cream-300g', sku: '9303328392632', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102696.jpg', name: 'Dairy Farmers Sour Cream Tub', size: '300g', brand: 'Dairy Farmers',
    category: 'dairy', emoji: '🥛', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 2.80, phaseOffset: 0 },
      coles:      { regularPrice: 3.50, salePrice: 2.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'perfect-italian-mozzarella-250g', sku: '9303655552887', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102961.jpg', name: 'Perfect Italian Mozzarella Grated', size: '250g', brand: 'Perfect Italian',
    category: 'dairy', emoji: '🧀', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 1 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'mainland-tasty-cheese-slices-250g', sku: '9303825923133', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103099.jpg', name: 'Mainland Tasty Slices 10pk', size: '250g', brand: 'Mainland',
    category: 'dairy', emoji: '🧀', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 2 },
      coles:      { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'flora-proactiv-margarine-250g', sku: '9303386417281', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102743.jpg', name: 'Flora ProActiv Margarine Spread', size: '250g', brand: 'Flora',
    category: 'dairy', emoji: '🧈', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'giel-thickened-cream-600ml', sku: '9302940738594', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102382.jpg', name: 'Bulla Thickened Cream Bottle', size: '600ml', brand: 'Bulla',
    category: 'dairy', emoji: '🥛', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 3.80, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 3.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'danone-activia-yogurt-4pk', sku: '9303029627418', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102454.jpg', name: 'Danone Activia Probiotics Yogurt', size: '4 x 125g', brand: 'Danone',
    category: 'dairy', emoji: '🥛', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.20, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 5.20, salePrice: 3.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'chobani-yogurt-pouch-140g', sku: '9302883948512', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102336.jpg', name: 'Chobani Greek Yogurt Pouch Strawberry', size: '140g', brand: 'Chobani',
    category: 'dairy', emoji: '🥛', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.50, salePrice: 1.80, phaseOffset: 1 },
      coles:      { regularPrice: 2.50, salePrice: 1.80, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'yakult-fermented-milk-5pk', sku: '9303032096552', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102456.jpg', name: 'Yakult Fermented Milk Drink', size: '5 x 65ml', brand: 'Yakult',
    category: 'dairy', emoji: '🥛', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 4.20, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 4.20, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'woolworths-feta-cheese-200g', sku: '9303146911283', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102549.jpg', name: 'Woolworths Danish Feta Cheese', size: '200g', brand: 'Woolworths',
    category: 'dairy', emoji: '🧀', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.00, salePrice: 4.00, phaseOffset: 0 },
      coles:      { regularPrice: 5.00, salePrice: 4.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'castello-creamy-blue-cheese-150g', sku: '9303671602258', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102974.jpg', name: 'Castello Double Cream Blue Cheese', size: '150g', brand: 'Castello',
    category: 'dairy', emoji: '🧀', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 0 },
      coles:      { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'cold-power-laundry-liquid-2l', sku: '9303367898776', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102728.jpg', name: 'Cold Power Laundry Liquid Sensitive', size: '2L', brand: 'Cold Power',
    category: 'household', emoji: '🧼', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 18.40, salePrice: 11.96, phaseOffset: 1 },
woolworths: { regularPrice: 20.00, salePrice: 10.00, phaseOffset: 0 },
      coles:      { regularPrice: 20.00, salePrice: 10.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'fairy-dishwasher-tablets-44pk', sku: '9303483948074', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102822.jpg', name: 'Fairy Dishwasher Tablets Plus', size: '44 Pack', brand: 'Fairy',
    category: 'household', emoji: '🍽️', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 38.64, salePrice: 25.12, phaseOffset: 1 },
woolworths: { regularPrice: 42.00, salePrice: 21.00, phaseOffset: 0 },
      coles:      { regularPrice: 42.00, salePrice: 21.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'dettol-liquid-handwash-refill-500ml', sku: '9304111108110', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103330.jpg', name: 'Dettol Handwash Liquid Refill', size: '500ml', brand: 'Dettol',
    category: 'household', emoji: '🧴', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 6.90, salePrice: 4.49, phaseOffset: 1 },
woolworths: { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 0 },
      coles:      { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'finish-dishwasher-rinse-aid-500ml', sku: '9303837034236', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103108.jpg', name: 'Finish Rinse Aid Jet Dry', size: '500ml', brand: 'Finish',
    category: 'household', emoji: '🍽️', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 10.58, salePrice: 6.88, phaseOffset: 1 },
woolworths: { regularPrice: 11.50, salePrice: 7.00, phaseOffset: 1 },
      coles:      { regularPrice: 11.50, salePrice: 7.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'morning-fresh-dish-liquid-400ml', sku: '9303598762805', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102915.jpg', name: 'Morning Fresh Lemon Dishwashing', size: '400ml', brand: 'Morning Fresh',
    category: 'household', emoji: '🧴', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 5.06, salePrice: 3.29, phaseOffset: 1 },
woolworths: { regularPrice: 5.50, salePrice: 2.75, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 2.75, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'harpic-active-fresh-toilet-cleaner-700ml', sku: '9304670366961', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103783.jpg', name: 'Harpic Toilet Cleaner Gel Marine', size: '700ml', brand: 'Harpic',
    category: 'household', emoji: '🚽', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.52, salePrice: 3.59, phaseOffset: 1 },
woolworths: { regularPrice: 6.00, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.00, salePrice: 3.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'pine-o-cleen-disinfectant-wipes-120pk', sku: '9304292589459', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103477.jpg', name: 'Pine O Cleen Disinfectant Wipes Lemon', size: '120 Pack', brand: 'Pine O Cleen',
    category: 'household', emoji: '🧹', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 10.12, salePrice: 6.58, phaseOffset: 1 },
woolworths: { regularPrice: 11.00, salePrice: 5.50, phaseOffset: 2 },
      coles:      { regularPrice: 11.00, salePrice: 5.50, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'ajax-spray-wipe-glass-cleaner-500ml', sku: '9304043206925', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103275.jpg', name: 'Ajax Spray n Wipe Glass Cleaner', size: '500ml', brand: 'Ajax',
    category: 'household', emoji: '💨', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.06, salePrice: 3.29, phaseOffset: 1 },
woolworths: { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'palmolive-dish-liquid-original-750ml', sku: '9304255552449', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103447.jpg', name: 'Palmolive Ultra Dishwashing Liquid', size: '750ml', brand: 'Palmolive',
    category: 'household', emoji: '🧴', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.98, salePrice: 3.89, phaseOffset: 1 },
woolworths: { regularPrice: 6.50, salePrice: 4.00, phaseOffset: 1 },
      coles:      { regularPrice: 6.50, salePrice: 4.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'earth-choice-dish-liquid-1l', sku: '9303160491520', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102560.jpg', name: 'Earth Choice Lemon Dishwashing Liquid', size: '1L', brand: 'Earth Choice',
    category: 'household', emoji: '🌿', cycleWeeks: 99,
    stores: {
      chemist_warehouse: { regularPrice: 4.14, salePrice: 2.69, phaseOffset: 1 },
woolworths: { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'vanish-napisan-oxipromote-3kg', sku: '9303581478867', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102901.jpg', name: 'Vanish NapiSan Oxi Action Powder', size: '3kg', brand: 'Vanish',
    category: 'household', emoji: '🧺', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 23.92, salePrice: 15.55, phaseOffset: 1 },
woolworths: { regularPrice: 26.00, salePrice: 16.00, phaseOffset: 3 },
      coles:      { regularPrice: 26.00, salePrice: 16.00, phaseOffset: 5 },
      amazon:     null,
    }
  },
  {
    id: 'dynamo-laundry-liquid-2l', sku: '9302908639852', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102356.jpg', name: 'Dynamo Professional Laundry Liquid', size: '2L', brand: 'Dynamo',
    category: 'household', emoji: '🧼', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 22.08, salePrice: 14.35, phaseOffset: 1 },
woolworths: { regularPrice: 24.00, salePrice: 12.00, phaseOffset: 0 },
      coles:      { regularPrice: 24.00, salePrice: 12.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'comfort-fabric-softener-900ml', sku: '9303397528384', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102752.jpg', name: 'Comfort Fabric Conditioner Pure', size: '900ml', brand: 'Comfort',
    category: 'household', emoji: '🌸', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 8.74, salePrice: 5.68, phaseOffset: 1 },
woolworths: { regularPrice: 9.50, salePrice: 5.50, phaseOffset: 2 },
      coles:      { regularPrice: 9.50, salePrice: 5.50, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'duck-toilet-fresh-disc-starter', sku: '9303688886196', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102988.jpg', name: 'Toilet Duck Fresh Discs Lime', size: '36ml', brand: 'Duck',
    category: 'household', emoji: '🚽', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 6.90, salePrice: 4.49, phaseOffset: 1 },
woolworths: { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 0 },
      coles:      { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'chux-superwipes-10pk', sku: '9302416047619', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101957.jpg', name: 'Chux Superwipes Roll Cloths', size: '10 Pack', brand: 'Chux',
    category: 'household', emoji: '🧹', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.06, salePrice: 3.29, phaseOffset: 1 },
woolworths: { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'wonder-white-bread-sliced-700g', sku: '9303422219724', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102772.jpg', name: 'Wonder White Sliced Toast Bread', size: '700g', brand: 'Wonder White',
    category: 'bakery', emoji: '🍞', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.60, salePrice: 3.20, phaseOffset: 0 },
      coles:      { regularPrice: 4.60, salePrice: 3.20, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'helgas-rye-bread-680g', sku: '9302308640290', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101870.jpg', name: 'Helgas Traditional Rye Slices', size: '680g', brand: 'Helgas',
    category: 'bakery', emoji: '🍞', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.20, salePrice: 4.20, phaseOffset: 1 },
      coles:      { regularPrice: 5.20, salePrice: 4.20, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'abbotts-sourdough-bread-loaf', sku: '9303464195002', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102806.jpg', name: 'Abbotts Bakery Sourdough Loaf', size: '680g', brand: 'Abbotts',
    category: 'bakery', emoji: '🍞', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 4.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'coles-croissants-3pk', sku: '9302458022897', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101991.jpg', name: 'Coles Bakery Croissants', size: '3 Pack', brand: 'Coles',
    category: 'bakery', emoji: '🥐', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 3.50, salePrice: 3.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'woolworths-muffins-choc-chip-4pk', sku: '9303916046524', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103172.jpg', name: 'WW Choc Chip Muffins 4pk', size: '4 Pack', brand: 'Woolworths',
    category: 'bakery', emoji: '🧁', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.00, salePrice: 5.00, phaseOffset: 0 },
      coles:      { regularPrice: 5.00, salePrice: 5.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'helgas-wholemeal-bread-680g', sku: '9303076540964', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102492.jpg', name: 'Helgas Traditional Wholemeal Loaf', size: '680g', brand: 'Helgas',
    category: 'bakery', emoji: '🍞', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.20, salePrice: 4.20, phaseOffset: 2 },
      coles:      { regularPrice: 5.20, salePrice: 4.20, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'mission-tortillas-large-8pk', sku: '9303324688931', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102693.jpg', name: 'Mission Original Tortillas Large', size: '8 Pack', brand: 'Mission',
    category: 'bakery', emoji: '🌯', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 0 },
      coles:      { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'tiptop-english-muffins-6pk', sku: '9303192590262', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102586.jpg', name: 'Tip Top English Muffins Original', size: '6 Pack', brand: 'Tip Top',
    category: 'bakery', emoji: '🥯', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 1 },
      coles:      { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'woolworths-crumpets-6pk', sku: '9302930862058', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102374.jpg', name: 'Woolworths Crumpets Original', size: '6 Pack', brand: 'Woolworths',
    category: 'bakery', emoji: '🥯', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.50, salePrice: 2.50, phaseOffset: 0 },
      coles:      { regularPrice: 2.50, salePrice: 2.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'tiptop-raisin-toast-bread-520g', sku: '9303477775239', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102817.jpg', name: 'Tip Top Cafe Raisin Toast Bread', size: '520g', brand: 'Tip Top',
    category: 'bakery', emoji: '🍞', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 0 },
      coles:      { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'mission-pita-bread-pocket-5pk', sku: '9303466664136', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102808.jpg', name: 'Mission White Pita Bread Pocket', size: '5 Pack', brand: 'Mission',
    category: 'bakery', emoji: '🫓', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 1 },
      coles:      { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'coles-chocolate-cookies-12pk', sku: '9303311108694', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102682.jpg', name: 'Coles Chocolate Chip Cookies Bakery', size: '12 Pack', brand: 'Coles',
    category: 'bakery', emoji: '🍪', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.00, salePrice: 3.00, phaseOffset: 0 },
      coles:      { regularPrice: 3.00, salePrice: 3.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'kelloggs-nutrigrain-500g', sku: '9302825923863', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102289.jpg', name: 'Kelloggs Nutri-Grain Cereal', size: '500g', brand: 'Kelloggs',
    category: 'breakfast', emoji: '🥣', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.50, salePrice: 5.50, phaseOffset: 1 },
      coles:      { regularPrice: 9.50, salePrice: 5.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'kelloggs-corn-flakes-380g', sku: '9302855553471', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102313.jpg', name: 'Kelloggs Corn Flakes Box', size: '380g', brand: 'Kelloggs',
    category: 'breakfast', emoji: '🥣', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'sanitarium-weetbix-1kg', sku: '9302708639998', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102194.jpg', name: 'Sanitarium Weet-Bix Cereal Box', size: '1kg', brand: 'Sanitarium',
    category: 'breakfast', emoji: '🥣', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 5.00, phaseOffset: 0 },
      coles:      { regularPrice: 6.00, salePrice: 5.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'uncle-tobys-plus-sports-cereal', sku: '9303741972577', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103031.jpg', name: 'Uncle Tobys Plus Sports Protein', size: '705g', brand: 'Uncle Tobys',
    category: 'breakfast', emoji: '🥣', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.50, salePrice: 5.50, phaseOffset: 0 },
      coles:      { regularPrice: 9.50, salePrice: 5.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'kelloggs-coco-pops-375g', sku: '9302620985741', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102123.jpg', name: 'Kelloggs Coco Pops Cereal Chocolate', size: '375g', brand: 'Kelloggs',
    category: 'breakfast', emoji: '🥣', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 2 },
      coles:      { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'kelloggs-sultana-bran-420g', sku: '9302991355841', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102423.jpg', name: 'Kelloggs Sultana Bran Cereal Box', size: '420g', brand: 'Kelloggs',
    category: 'breakfast', emoji: '🥣', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 3 },
      coles:      { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'uncle-tobys-oat-quick-sachets', sku: '9303565429496', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102888.jpg', name: 'Uncle Tobys Quick Sachets Creamy Honey', size: '12 Pack', brand: 'Uncle Tobys',
    category: 'breakfast', emoji: '🥣', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.00, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 7.00, salePrice: 4.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'carman-muesli-golden-oat-500g', sku: '9303296293890', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102670.jpg', name: 'Carmans Golden Oat Crunchy Muesli', size: '500g', brand: 'Carmans',
    category: 'breakfast', emoji: '🥣', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 1 },
      coles:      { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'kelloggs-froot-loops-285g', sku: '9302918516388', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102364.jpg', name: 'Kelloggs Froot Loops Colored Cereal', size: '285g', brand: 'Kelloggs',
    category: 'breakfast', emoji: '🥣', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 0 },
      coles:      { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'sanitarium-upandgo-choc-6pk', sku: '9303279009952', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102656.jpg', name: 'Sanitarium Up & Go Liquid Breakfast Choc', size: '6 x 250ml', brand: 'Sanitarium',
    category: 'breakfast', emoji: '🧃', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 11.50, salePrice: 7.00, phaseOffset: 2 },
      coles:      { regularPrice: 11.50, salePrice: 7.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'carman-muesli-bars-classic-6pk', sku: '9303575306032', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102896.jpg', name: 'Carmans Classic Fruit & Nut Bars', size: '6 Pack', brand: 'Carmans',
    category: 'breakfast', emoji: '🍫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'weetbix-bites-wild-berry-500g', sku: '9303341972869', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102707.jpg', name: 'Sanitarium Weet-Bix Bites Wild Berry', size: '500g', brand: 'Sanitarium',
    category: 'breakfast', emoji: '🥣', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 1 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'beef-mince-regular-1kg', sku: '9302560491958', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102074.jpg', name: 'WW Beef Mince 3 Star', size: '1kg', brand: 'Woolworths',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 13.00, salePrice: 13.00, phaseOffset: 0 },
      coles:      { regularPrice: 13.00, salePrice: 13.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'chicken-breast-fillets-1kg', sku: '9303104936005', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102515.jpg', name: 'WW Chicken Breast Fillets Skinless', size: '1kg', brand: 'Woolworths',
    category: 'meat', emoji: '🍗', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 11.50, salePrice: 11.50, phaseOffset: 0 },
      coles:      { regularPrice: 11.50, salePrice: 11.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'lamb-shoulder-chops-1kg', sku: '9302737035039', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102217.jpg', name: 'WW Lamb Shoulder Chops Fresh', size: '1kg', brand: 'Woolworths',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 18.00, salePrice: 18.00, phaseOffset: 0 },
      coles:      { regularPrice: 18.00, salePrice: 18.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'pork-loin-chops-1kg', sku: '9302238269971', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101813.jpg', name: 'Coles Pork Loin Chops Boneless', size: '1kg', brand: 'Coles',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 16.00, salePrice: 16.00, phaseOffset: 0 },
      coles:      { regularPrice: 16.00, salePrice: 16.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'salmon-fillets-skin-on-4pk', sku: '9303103701438', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102514.jpg', name: 'Tassal Salmon Fillets Skin On', size: '4 Pack 500g', brand: 'Tassal',
    category: 'meat', emoji: '🐟', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 22.00, salePrice: 19.00, phaseOffset: 0 },
      coles:      { regularPrice: 22.00, salePrice: 19.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'coles-beef-rump-steak-500g', sku: '9302908639852', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102356.jpg', name: 'Coles Beef Rump Steak Fresh', size: '500g', brand: 'Coles',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 14.00, salePrice: 14.00, phaseOffset: 0 },
      coles:      { regularPrice: 14.00, salePrice: 14.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'dondale-bacon-rashers-500g', sku: '9302949380563', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102389.jpg', name: 'Don Bacon Short Rashers Pack', size: '500g', brand: 'Don',
    category: 'meat', emoji: '🥓', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.50, salePrice: 7.50, phaseOffset: 0 },
      coles:      { regularPrice: 9.50, salePrice: 7.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'primas-frankfurts-skinless-1kg', sku: '9303723454072', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103016.jpg', name: 'Primo Skinless Frankfurts Tub', size: '1kg', brand: 'Primo',
    category: 'meat', emoji: '🌭', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 11.00, salePrice: 8.50, phaseOffset: 1 },
      coles:      { regularPrice: 11.00, salePrice: 8.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'primo-sliced-ham-value-pack', sku: '9303240738375', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102625.jpg', name: 'Primo English Ham Sliced Value Pack', size: '500g', brand: 'Primo',
    category: 'meat', emoji: '🥩', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 10.00, salePrice: 7.50, phaseOffset: 0 },
      coles:      { regularPrice: 10.00, salePrice: 7.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'safcol-premium-salmon-100g', sku: '9303002466944', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102432.jpg', name: 'Safcol Salmon in Springwater', size: '100g', brand: 'Safcol',
    category: 'meat', emoji: '🐟', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 1 },
      coles:      { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'primo-chorizo-sausage-375g', sku: '9303035800253', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102459.jpg', name: 'Primo Chorizo Twin Pack', size: '375g', brand: 'Primo',
    category: 'meat', emoji: '🌭', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 2 },
      coles:      { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'woolworths-beef-sausages-18pk', sku: '9303517281383', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102849.jpg', name: 'WW Thin Beef Sausages Value Pack', size: '1.7kg', brand: 'Woolworths',
    category: 'meat', emoji: '🌭', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 13.00, salePrice: 13.00, phaseOffset: 0 },
      coles:      { regularPrice: 13.00, salePrice: 13.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'mccain-frozen-chips-1kg', sku: '9302725923936', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102208.jpg', name: 'McCain Frozen Chips Straight Cut', size: '1kg', brand: 'McCain',
    category: 'frozen', emoji: '🍟', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'birds-eye-fish-fingers-375g', sku: '9303053084191', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102473.jpg', name: 'Birds Eye Fish Fingers 15pk', size: '375g', brand: 'Birds Eye',
    category: 'frozen', emoji: '🐟', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 1 },
      coles:      { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'mccain-frozen-pizza-bbq-400g', sku: '9303181479159', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102577.jpg', name: 'McCain Frozen Pizza BBQ Chicken', size: '400g', brand: 'McCain',
    category: 'frozen', emoji: '🍕', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 0 },
      coles:      { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'nannas-frozen-apple-pie-600g', sku: '9303185182860', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102580.jpg', name: 'Nannas Frozen Family Apple Pie', size: '600g', brand: 'Nannas',
    category: 'frozen', emoji: '🥧', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 2 },
      coles:      { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'patties-party-pies-12pk', sku: '9302725923936', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102208.jpg', name: 'Patties Party Beef Pies 12pk', size: '560g', brand: 'Patties',
    category: 'frozen', emoji: '🥧', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.50, salePrice: 6.50, phaseOffset: 0 },
      coles:      { regularPrice: 9.50, salePrice: 6.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'four-twenty-meat-pies-4pk', sku: '9303004936078', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102434.jpg', name: 'Four N Twenty Meat Pies Pack', size: '700g', brand: 'Four N Twenty',
    category: 'frozen', emoji: '🥧', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.00, salePrice: 6.00, phaseOffset: 3 },
      coles:      { regularPrice: 9.00, salePrice: 6.00, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'diana-chan-pork-dumplings', sku: '9303058022459', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102477.jpg', name: 'Diana Chan Pork & Chive Dumplings', size: '750g', brand: 'Diana Chan',
    category: 'frozen', emoji: '🥟', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 15.00, salePrice: 10.00, phaseOffset: 0 },
      coles:      { regularPrice: 15.00, salePrice: 10.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'steer-frozen-vegetables-peas-1kg', sku: '9303862960143', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103129.jpg', name: 'Birds Eye Frozen Garden Peas', size: '1kg', brand: 'Birds Eye',
    category: 'frozen', emoji: '🥦', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.20, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 5.20, salePrice: 4.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'sara-lee-french-vanilla-cheesecake', sku: '9304087651337', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103311.jpg', name: 'Sara Lee French Vanilla Cheesecake', size: '360g', brand: 'Sara Lee',
    category: 'frozen', emoji: '🍰', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 1 },
      coles:      { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'mccain-frozen-lasagne-400g', sku: '9302958022532', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102396.jpg', name: 'McCain Frozen Lasagne Meal', size: '400g', brand: 'McCain',
    category: 'frozen', emoji: '🍝', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'patties-sausage-rolls-12pk', sku: '9303106170572', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102516.jpg', name: 'Patties Party Sausage Rolls 12pk', size: '450g', brand: 'Patties',
    category: 'frozen', emoji: '🌭', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.50, salePrice: 6.50, phaseOffset: 1 },
      coles:      { regularPrice: 9.50, salePrice: 6.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'steers-garlic-bread-twin-pack', sku: '9303509873981', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102843.jpg', name: 'La Famiglia Garlic Bread Twin Pack', size: '400g', brand: 'La Famiglia',
    category: 'frozen', emoji: '🥖', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 2 },
      coles:      { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'colgate-toothpaste-total-115g', sku: '9303420985157', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102771.jpg', name: 'Colgate Total Clean Mint Toothpaste', size: '115g', brand: 'Colgate',
    category: 'personal-care', emoji: '🪥', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 5.98, salePrice: 3.89, phaseOffset: 1 },
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'palmolive-shampoo-milk-honey-350ml', sku: '9304016046451', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103253.jpg', name: 'Palmolive Shampoo Milk & Honey', size: '350ml', brand: 'Palmolive',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.06, salePrice: 3.29, phaseOffset: 1 },
woolworths: { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 1 },
      coles:      { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'rexona-men-sport-deodorant-250ml', sku: '9303764194783', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103049.jpg', name: 'Rexona Men Sport Deodorant Aerosol', size: '250ml', brand: 'Rexona',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 7.82, salePrice: 5.08, phaseOffset: 1 },
woolworths: { regularPrice: 8.50, salePrice: 5.50, phaseOffset: 0 },
      coles:      { regularPrice: 8.50, salePrice: 5.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'radox-shower-gel-lemon-500ml', sku: '9303213577901', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102603.jpg', name: 'Radox Shower Gel Lemon & Tea Tree', size: '500ml', brand: 'Radox',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.98, salePrice: 3.89, phaseOffset: 1 },
woolworths: { regularPrice: 6.50, salePrice: 4.00, phaseOffset: 2 },
      coles:      { regularPrice: 6.50, salePrice: 4.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'colgate-plax-mouthwash-mint-500ml', sku: '9303888886050', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103150.jpg', name: 'Colgate Plax Freshmint Mouthwash', size: '500ml', brand: 'Colgate',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 6.90, salePrice: 4.49, phaseOffset: 1 },
woolworths: { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 1 },
      coles:      { regularPrice: 7.50, salePrice: 5.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'head-shoulders-clean-shampoo-400ml', sku: '9303958021802', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103206.jpg', name: 'Head & Shoulders Clean Shampoo', size: '400ml', brand: 'Head & Shoulders',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 11.50, salePrice: 7.48, phaseOffset: 1 },
woolworths: { regularPrice: 12.50, salePrice: 8.00, phaseOffset: 0 },
      coles:      { regularPrice: 12.50, salePrice: 8.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'pantene-conditioner-smooth-350ml', sku: '9303825923133', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103099.jpg', name: 'Pantene Conditioner Daily Moisture', size: '350ml', brand: 'Pantene',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 8.28, salePrice: 5.38, phaseOffset: 1 },
woolworths: { regularPrice: 9.00, salePrice: 5.50, phaseOffset: 2 },
      coles:      { regularPrice: 9.00, salePrice: 5.50, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'palmolive-soap-bars-milk-honey-4pk', sku: '9304074071100', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103300.jpg', name: 'Palmolive Soap Bars Moisture Care', size: '4 Pack', brand: 'Palmolive',
    category: 'personal-care', emoji: '🧼', cycleWeeks: 99,
    stores: {
      chemist_warehouse: { regularPrice: 5.06, salePrice: 3.29, phaseOffset: 1 },
woolworths: { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'dove-body-wash-beauty-cream-1l', sku: '9303514812249', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102847.jpg', name: 'Dove Body Wash Beauty Nourishing', size: '1L', brand: 'Dove',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 12.88, salePrice: 8.37, phaseOffset: 1 },
woolworths: { regularPrice: 14.00, salePrice: 9.00, phaseOffset: 1 },
      coles:      { regularPrice: 14.00, salePrice: 9.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'gillette-mach3-razor-blades-4pk', sku: '9303637034382', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102946.jpg', name: 'Gillette Mach3 Razor Blades Refills', size: '4 Pack', brand: 'Gillette',
    category: 'personal-care', emoji: '🪒', cycleWeeks: 99,
    stores: {
      chemist_warehouse: { regularPrice: 16.56, salePrice: 10.76, phaseOffset: 1 },
woolworths: { regularPrice: 18.00, salePrice: 14.50, phaseOffset: 0 },
      coles:      { regularPrice: 18.00, salePrice: 14.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'lynx-africa-body-spray-155ml', sku: '9303227158138', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102614.jpg', name: 'Lynx Africa Men Body Spray', size: '155ml', brand: 'Lynx',
    category: 'personal-care', emoji: '💨', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 7.82, salePrice: 5.08, phaseOffset: 1 },
woolworths: { regularPrice: 8.50, salePrice: 5.50, phaseOffset: 3 },
      coles:      { regularPrice: 8.50, salePrice: 5.50, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'listerine-freshburst-mouthwash-250ml', sku: '9304402465922', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103566.jpg', name: 'Listerine Freshburst Mouthwash', size: '250ml', brand: 'Listerine',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 5.06, salePrice: 3.29, phaseOffset: 1 },
woolworths: { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'huggies-nappies-size-4-60pk', sku: '9303081479232', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102496.jpg', name: 'Huggies Ultra Dry Nappies Size 4', size: '60 Pack', brand: 'Huggies',
    category: 'baby', emoji: '👶', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 33.12, salePrice: 21.53, phaseOffset: 1 },
woolworths: { regularPrice: 36.00, salePrice: 29.00, phaseOffset: 0 },
      coles:      { regularPrice: 36.00, salePrice: 29.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'johnsons-baby-wipes-fragrance-free-80pk', sku: '9304630860817', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103751.jpg', name: 'Johnsons Baby Wipes Fragrance Free', size: '80 Pack', brand: 'Johnsons',
    category: 'baby', emoji: '👶', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 4.14, salePrice: 2.69, phaseOffset: 1 },
woolworths: { regularPrice: 4.50, salePrice: 3.20, phaseOffset: 1 },
      coles:      { regularPrice: 4.50, salePrice: 3.20, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'baby-love-nappies-size-3-50pk', sku: '9303262960581', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102643.jpg', name: 'BabyLove Cosifit Nappies Size 3', size: '50 Pack', brand: 'BabyLove',
    category: 'baby', emoji: '👶', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 22.08, salePrice: 14.35, phaseOffset: 1 },
woolworths: { regularPrice: 24.00, salePrice: 19.00, phaseOffset: 2 },
      coles:      { regularPrice: 24.00, salePrice: 19.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'curash-baby-wipes-soap-free-80pk', sku: '9303719750371', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103013.jpg', name: 'Curash Baby Wipes Soap Free', size: '80 Pack', brand: 'Curash',
    category: 'baby', emoji: '👶', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 4.42, salePrice: 2.87, phaseOffset: 1 },
woolworths: { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'farex-baby-rice-cereal-125g', sku: '9302990121274', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102422.jpg', name: 'Farex Baby Cereal Rice', size: '125g', brand: 'Farex',
    category: 'baby', emoji: '🥣', cycleWeeks: 99,
    stores: {
      chemist_warehouse: { regularPrice: 3.22, salePrice: 2.09, phaseOffset: 1 },
woolworths: { regularPrice: 3.50, salePrice: 2.80, phaseOffset: 0 },
      coles:      { regularPrice: 3.50, salePrice: 2.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'sudocrem-baby-healing-cream-125g', sku: '9303658022021', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102963.jpg', name: 'Sudocrem Nappy Recovery Cream', size: '125g', brand: 'Sudocrem',
    category: 'baby', emoji: '🧴', cycleWeeks: 99,
    stores: {
      chemist_warehouse: { regularPrice: 11.04, salePrice: 7.18, phaseOffset: 1 },
woolworths: { regularPrice: 12.00, salePrice: 9.50, phaseOffset: 0 },
      coles:      { regularPrice: 12.00, salePrice: 9.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'karicare-toddler-milk-stage-3-900g', sku: '9303798762659', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103077.jpg', name: 'Karicare Toddler Milk Stage 3 Formula', size: '900g', brand: 'Karicare',
    category: 'baby', emoji: '🍼', cycleWeeks: 99,
    stores: {
      chemist_warehouse: { regularPrice: 20.24, salePrice: 13.16, phaseOffset: 1 },
woolworths: { regularPrice: 22.00, salePrice: 22.00, phaseOffset: 0 },
      coles:      { regularPrice: 22.00, salePrice: 22.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'bellamys-organic-apple-cinnamon-120g', sku: '9304206169769', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103407.jpg', name: 'Bellamys Organic Apple Cinnamon Puree', size: '120g', brand: 'Bellamys',
    category: 'baby', emoji: '🍎', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 2.58, salePrice: 1.68, phaseOffset: 1 },
woolworths: { regularPrice: 2.80, salePrice: 2.20, phaseOffset: 1 },
      coles:      { regularPrice: 2.80, salePrice: 2.20, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'raffertys-garden-banana-pear-120g', sku: '9303790120690', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103070.jpg', name: 'Raffertys Garden Custard Banana Pear', size: '120g', brand: 'Raffertys',
    category: 'baby', emoji: '🍌', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 2.58, salePrice: 1.68, phaseOffset: 1 },
woolworths: { regularPrice: 2.80, salePrice: 2.20, phaseOffset: 0 },
      coles:      { regularPrice: 2.80, salePrice: 2.20, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'baby-balm-johnson-100ml', sku: '9302580245030', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102090.jpg', name: 'Johnsons Baby Moisturizing Balm', size: '100ml', brand: 'Johnsons',
    category: 'baby', emoji: '🧴', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.52, salePrice: 3.59, phaseOffset: 1 },
woolworths: { regularPrice: 6.00, salePrice: 4.80, phaseOffset: 0 },
      coles:      { regularPrice: 6.00, salePrice: 4.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'pedigree-dog-food-beef-12kg-bag', sku: '9303467898703', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102809.jpg', name: 'Pedigree Dry Dog Food Beef Bag', size: '1.2kg', brand: 'Pedigree',
    category: 'pet', emoji: '🐶', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 8.50, salePrice: 6.50, phaseOffset: 0 },
      coles:      { regularPrice: 8.50, salePrice: 6.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'dine-cat-food-tuna-pouch-85g', sku: '9303175306324', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102572.jpg', name: 'Dine Daily Wet Cat Food Tuna', size: '85g', brand: 'Dine',
    category: 'pet', emoji: '🐱', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 1.80, salePrice: 1.30, phaseOffset: 1 },
      coles:      { regularPrice: 1.80, salePrice: 1.30, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'supercoat-dog-food-chicken-26kg', sku: '9303628392413', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102939.jpg', name: 'Purina Supercoat Adult Dry Dog Food', size: '2.6kg', brand: 'Purina',
    category: 'pet', emoji: '🐶', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 16.00, salePrice: 12.00, phaseOffset: 2 },
      coles:      { regularPrice: 16.00, salePrice: 12.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'optimum-dry-cat-food-chicken-800g', sku: '9303771602185', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103055.jpg', name: 'Optimum Adult Dry Cat Food Chicken', size: '800g', brand: 'Optimum',
    category: 'pet', emoji: '🐱', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 11.50, salePrice: 8.50, phaseOffset: 0 },
      coles:      { regularPrice: 11.50, salePrice: 8.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'my-dog-beef-poultry-meat-400g', sku: '9303264195148', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102644.jpg', name: 'My Dog Wet Dog Food Beef Cans', size: '400g', brand: 'My Dog',
    category: 'pet', emoji: '🐶', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.30, salePrice: 2.40, phaseOffset: 0 },
      coles:      { regularPrice: 3.30, salePrice: 2.40, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'whiskas-cat-food-poultry-12pk', sku: '9303450614765', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102795.jpg', name: 'Whiskas Wet Cat Food Gravy Pouches', size: '12 Pack', brand: 'Whiskas',
    category: 'pet', emoji: '🐱', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 10.50, salePrice: 8.00, phaseOffset: 1 },
      coles:      { regularPrice: 10.50, salePrice: 8.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'schmackos-dog-treats-beef-strap', sku: '9303783947855', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103065.jpg', name: 'Schmackos Strapz Dog Treats Beef', size: '200g', brand: 'Schmackos',
    category: 'pet', emoji: '🍖', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.80, salePrice: 4.50, phaseOffset: 3 },
      coles:      { regularPrice: 6.80, salePrice: 4.50, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'fancies-cat-treat-puree-4pk', sku: '9303186417427', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102581.jpg', name: 'Fancy Feast Puree Kiss Treats', size: '4 Pack', brand: 'Fancy Feast',
    category: 'pet', emoji: '🐱', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 3.20, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 3.20, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'tux-dog-biscuits-value-pack-1kg', sku: '9303675305959', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102977.jpg', name: 'Purina Lucky Dog Bones Biscuits', size: '1kg', brand: 'Purina',
    category: 'pet', emoji: '🍖', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.50, salePrice: 6.00, phaseOffset: 0 },
      coles:      { regularPrice: 7.50, salePrice: 6.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'friskies-cat-dry-food-15kg-box', sku: '9303458022167', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102801.jpg', name: 'Purina Friskies Seafood Sensations', size: '1.5kg', brand: 'Purina',
    category: 'pet', emoji: '🐱', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 10.50, salePrice: 7.50, phaseOffset: 0 },
      coles:      { regularPrice: 10.50, salePrice: 7.50, phaseOffset: 2 },
      amazon:     null,
    }
  }
,
  {
    id: 'panadol-rapid-20pk', sku: '9302061726890', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101670.jpg', name: 'Panadol Rapid Caplets', size: '20 Pack', brand: 'Panadol',
    category: 'health', emoji: '💊', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 5.06, salePrice: 3.29, phaseOffset: 1 },
woolworths: { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'nurofen-24pk', sku: '9301396295277', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101131.jpg', name: 'Nurofen Ibuprofen 200mg', size: '24 Pack', brand: 'Nurofen',
    category: 'health', emoji: '💊', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.98, salePrice: 3.89, phaseOffset: 1 },
woolworths: { regularPrice: 6.50, salePrice: 4.80, phaseOffset: 2 },
      coles:      { regularPrice: 6.50, salePrice: 4.80, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'musashi-protein-bar-choc', sku: '9302948145996', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102388.jpg', name: 'Musashi High Protein Bar Chocolate', size: '60g', brand: 'Musashi',
    category: 'health', emoji: '🍫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 4.14, salePrice: 2.69, phaseOffset: 1 },
woolworths: { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 1 },
      coles:      { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'natures-own-fish-oil', sku: '9302462961165', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101995.jpg', name: 'Natures Own Fish Oil 1000mg', size: '200 Pack', brand: 'Natures Own',
    category: 'health', emoji: '💊', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 20.24, salePrice: 13.16, phaseOffset: 1 },
woolworths: { regularPrice: 22.00, salePrice: 11.00, phaseOffset: 0 },
      coles:      { regularPrice: 22.00, salePrice: 11.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'berocca-performance-orange', sku: '9303228392705', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102615.jpg', name: 'Berocca Performance Effervescent Orange', size: '30 Pack', brand: 'Berocca',
    category: 'health', emoji: '🥤', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 17.02, salePrice: 11.06, phaseOffset: 1 },
woolworths: { regularPrice: 18.50, salePrice: 12.00, phaseOffset: 3 },
      coles:      { regularPrice: 18.50, salePrice: 12.00, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'white-wings-flour-sr-2kg', sku: '9302861726306', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102318.jpg', name: 'White Wings Self Raising Flour', size: '2kg', brand: 'White Wings',
    category: 'baking', emoji: '🧁', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'csr-white-sugar-1kg', sku: '9302238269971', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101813.jpg', name: 'CSR White Sugar Pure Cane', size: '1kg', brand: 'CSR',
    category: 'baking', emoji: '🧁', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 2.80, phaseOffset: 0 },
      coles:      { regularPrice: 2.80, salePrice: 2.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'queen-maple-syrup-375ml', sku: '9302665430153', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102159.jpg', name: 'Queen Maple Active Syrup', size: '375ml', brand: 'Queen',
    category: 'baking', emoji: '🍯', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 1 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'cadbury-baking-chocolate-180g', sku: '9303337034601', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102703.jpg', name: 'Cadbury Baking Milk Chocolate Block', size: '180g', brand: 'Cadbury',
    category: 'baking', emoji: '🍫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 2 },
      coles:      { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'sunrice-medium-rice-5kg', sku: '9302739504173', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102219.jpg', name: 'SunRice Medium Grain Rice Bag', size: '5kg', brand: 'SunRice',
    category: 'pantry', emoji: '🌾', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 18.00, salePrice: 9.00, phaseOffset: 0 },
      coles:      { regularPrice: 18.00, salePrice: 9.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'heinz-spaghetti-canned-420g', sku: '9303106170572', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102516.jpg', name: 'Heinz Spaghetti in Tomato Sauce', size: '420g', brand: 'Heinz',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.50, salePrice: 1.80, phaseOffset: 1 },
      coles:      { regularPrice: 2.50, salePrice: 1.80, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'spc-spaghetti-3pk', sku: '9302043208385', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101655.jpg', name: 'SPC Spaghetti Rich Tomato Can', size: '3 x 220g', brand: 'SPC',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 2 },
      coles:      { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'kelloggs-lcm-coco-bars', sku: '9302655553617', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102151.jpg', name: 'Kelloggs LCMs Coco Pops Snack Bars', size: '6 Pack', brand: 'Kelloggs',
    category: 'pantry', emoji: '🍫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 3 },
      coles:      { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 1 },
      amazon:     null,
    }
  },
  {
    id: 'uncle-tobys-muesli-bars-choc', sku: '9303417281456', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102768.jpg', name: 'Uncle Tobys Chewy Bars Choc Chip', size: '6 Pack', brand: 'Uncle Tobys',
    category: 'pantry', emoji: '🌾', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 2 },
      amazon:     { regularPrice: 52.80, salePrice: 35.70, phaseOffset: 1, packQty: 12, packLabel: '12 × 6 Pack' },
    }
  },
  {
    id: 'pauls-double-choc-custard', sku: '9303074071830', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102490.jpg', name: 'Pauls Double Choc Custard Tub', size: '1kg', brand: 'Pauls',
    category: 'dairy', emoji: '🍮', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 4.80, phaseOffset: 1 },
      coles:      { regularPrice: 6.50, salePrice: 4.80, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'kraft-singles-cheese-30pk', sku: '9302922220089', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102367.jpg', name: 'Kraft Singles Cheese Slices', size: '30 Pack', brand: 'Kraft',
    category: 'dairy', emoji: '🧀', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 8.50, salePrice: 6.50, phaseOffset: 2 },
      coles:      { regularPrice: 8.50, salePrice: 6.50, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'chicken-thigh-fillets-1kg', sku: '9302970368202', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102406.jpg', name: 'WW Chicken Thigh Fillets Boneless', size: '1kg', brand: 'Woolworths',
    category: 'meat', emoji: '🍗', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 14.50, salePrice: 14.50, phaseOffset: 0 },
      coles:      { regularPrice: 14.50, salePrice: 14.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'pork-belly-slices-500g', sku: '9302481479670', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102010.jpg', name: 'WW Pork Belly Slices Fresh', size: '500g', brand: 'Woolworths',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 12.00, salePrice: 12.00, phaseOffset: 0 },
      coles:      { regularPrice: 12.00, salePrice: 12.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'mccain-pub-chips-1kg', sku: '9302314813125', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101875.jpg', name: 'McCain Pub Size Frozen Chips', size: '1kg', brand: 'McCain',
    category: 'frozen', emoji: '🍟', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.80, salePrice: 4.20, phaseOffset: 1 },
      coles:      { regularPrice: 5.80, salePrice: 4.20, phaseOffset: 3 },
      amazon:     { regularPrice: 4.64, salePrice: 3.57, phaseOffset: 2, packQty: 1, packLabel: '1 × 1kg' },
    }
  },
  {
    id: 'birds-eye-fish-cakes-300g', sku: '9302753084410', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102230.jpg', name: 'Birds Eye Frozen Fish Cakes', size: '300g', brand: 'Birds Eye',
    category: 'frozen', emoji: '🐟', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 2 },
      amazon:     { regularPrice: 5.20, salePrice: 3.82, phaseOffset: 1, packQty: 1, packLabel: '1 × 300g' },
    }
  },
  {
    id: 'celery-bunch-each', sku: '9302053084921', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101663.jpg', name: 'Celery Bunch Fresh Premium', size: 'Each', brand: 'Fresh',
    category: 'produce', emoji: '🥬', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 0 },
      coles:      { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'sweet-potatoes-1kg', sku: '9302197529260', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101780.jpg', name: 'Sweet Potatoes Gold Fresh', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍠', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'colgate-toothbrush-3pk', sku: '9302717281967', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102201.jpg', name: 'Colgate Zig Zag Toothbrush Medium', size: '3 Pack', brand: 'Colgate',
    category: 'personal-care', emoji: '🪥', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 7.36, salePrice: 4.78, phaseOffset: 1 },
woolworths: { regularPrice: 8.00, salePrice: 4.00, phaseOffset: 1 },
      coles:      { regularPrice: 8.00, salePrice: 4.00, phaseOffset: 3 },
      amazon:     { regularPrice: 6.40, salePrice: 3.40, phaseOffset: 2, packQty: 1, packLabel: '1 × 3 Pack' },
    }
  },
  {
    id: 'sensodyne-toothpaste-110g', sku: '9302990121274', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102422.jpg', name: 'Sensodyne Daily Care Toothpaste', size: '110g', brand: 'Sensodyne',
    category: 'personal-care', emoji: '🪥', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 7.82, salePrice: 5.08, phaseOffset: 1 },
woolworths: { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 2 },
      coles:      { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 4 },
      amazon:     { regularPrice: 6.80, salePrice: 5.10, phaseOffset: 3, packQty: 1, packLabel: '1 × 110g' },
    }
  },
  {
    id: 'dettol-bar-soap-4pk', sku: '9302224689734', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101802.jpg', name: 'Dettol Anti-Bacterial Soap Bars', size: '4 Pack', brand: 'Dettol',
    category: 'personal-care', emoji: '🧼', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.98, salePrice: 3.89, phaseOffset: 1 },
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 2 },
      amazon:     { regularPrice: 5.20, salePrice: 3.82, phaseOffset: 1, packQty: 1, packLabel: '1 × 4 Pack' },
    }
  },
  {
    id: 'fairy-platinum-dishwasher-60pk', sku: '9303633330681', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102943.jpg', name: 'Fairy Platinum Plus Dishwasher Tabs', size: '60 Pack', brand: 'Fairy',
    category: 'household', emoji: '🍽️', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 47.84, salePrice: 31.10, phaseOffset: 1 },
woolworths: { regularPrice: 52.00, salePrice: 26.00, phaseOffset: 3 },
      coles:      { regularPrice: 52.00, salePrice: 26.00, phaseOffset: 5 },
      amazon:     { regularPrice: 41.60, salePrice: 22.10, phaseOffset: 4, packQty: 1, packLabel: '1 × 60 Pack' },
    }
  },
  {
    id: 'ajax-eco-wipe-multi-purpose', sku: '9303314812395', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102685.jpg', name: 'Ajax Multi Purpose Wipes Lemon', size: '110 Pack', brand: 'Ajax',
    category: 'household', emoji: '🧹', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 9.20, salePrice: 5.98, phaseOffset: 1 },
woolworths: { regularPrice: 10.00, salePrice: 5.00, phaseOffset: 1 },
      coles:      { regularPrice: 10.00, salePrice: 5.00, phaseOffset: 3 },
      amazon:     { regularPrice: 8.00, salePrice: 4.25, phaseOffset: 2, packQty: 1, packLabel: '1 × 110 Pack' },
    }
  },
  {
    id: 'duck-toilet-gel-750ml', sku: '9302345677300', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101900.jpg', name: 'Duck Deep Action Toilet Gel Pine', size: '750ml', brand: 'Duck',
    category: 'household', emoji: '🚽', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 5.34, salePrice: 3.47, phaseOffset: 1 },
woolworths: { regularPrice: 5.80, salePrice: 3.80, phaseOffset: 0 },
      coles:      { regularPrice: 5.80, salePrice: 3.80, phaseOffset: 2 },
      amazon:     { regularPrice: 4.64, salePrice: 3.23, phaseOffset: 1, packQty: 1, packLabel: '1 × 750ml' },
    }
  },
  {
    id: 'harpic-fresh-power-toilet-block', sku: '9303807404628', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103084.jpg', name: 'Harpic Fresh Power Toilet Block', size: '39g', brand: 'Harpic',
    category: 'household', emoji: '🚽', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.06, salePrice: 3.29, phaseOffset: 1 },
woolworths: { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 2 },
      coles:      { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 4 },
      amazon:     { regularPrice: 4.40, salePrice: 2.98, phaseOffset: 3, packQty: 1, packLabel: '1 × 39g' },
    }
  },
  {
    id: 'supercoat-cat-food-15kg', sku: '9302672837555', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102165.jpg', name: 'Supercoat Dry Cat Food Chicken', size: '1.5kg', brand: 'Supercoat',
    category: 'pet', emoji: '🐱', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 11.00, salePrice: 8.50, phaseOffset: 0 },
      coles:      { regularPrice: 11.00, salePrice: 8.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'my-dog-gourmet-beef-100g', sku: '9302648146215', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102145.jpg', name: 'My Dog Gourmet Beef Tray', size: '100g', brand: 'My Dog',
    category: 'pet', emoji: '🐶', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 1.80, salePrice: 1.30, phaseOffset: 1 },
      coles:      { regularPrice: 1.80, salePrice: 1.30, phaseOffset: 3 },
      amazon:     null,
    }
  }
,
  {
    id: 'basmati-rice-premium', sku: '9302485183371', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102013.jpg', name: 'Basmati Rice Premium', size: '2kg', brand: 'SunRice',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 8.00, salePrice: 5.50, phaseOffset: 0 },
      coles:      { regularPrice: 8.00, salePrice: 5.50, phaseOffset: 2 },
      amazon:     { regularPrice: 76.80, salePrice: 56.10, phaseOffset: 1, packQty: 12, packLabel: '12 × 2kg' },
    }
  },
  {
    id: 'jasmine-rice-fragrant', sku: '9302598763535', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102105.jpg', name: 'Jasmine Rice Fragrant', size: '5kg', brand: 'SunRice',
    category: 'pantry', emoji: '🥫', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 18.00, salePrice: 10.00, phaseOffset: 0 },
      coles:      { regularPrice: 18.00, salePrice: 10.00, phaseOffset: 2 },
      amazon:     { regularPrice: 172.80, salePrice: 102.00, phaseOffset: 1, packQty: 12, packLabel: '12 × 5kg' },
    }
  },
  {
    id: 'extra-virgin-olive-oil', sku: '9302722220235', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102205.jpg', name: 'Extra Virgin Olive Oil', size: '750ml', brand: 'Cobram Estate',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 16.00, salePrice: 12.00, phaseOffset: 2 },
      coles:      { regularPrice: 16.00, salePrice: 12.00, phaseOffset: 0 },
      amazon:     { regularPrice: 153.60, salePrice: 122.40, phaseOffset: 3, packQty: 12, packLabel: '12 × 750ml' },
    }
  },
  {
    id: 'pure-canola-cooking-oil', sku: '9302803701657', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102271.jpg', name: 'Pure Canola Cooking Oil', size: '1L', brand: 'WW',
    category: 'pantry', emoji: '🥫', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 5.50, phaseOffset: 1 },
      coles:      { regularPrice: 5.50, salePrice: 5.50, phaseOffset: 3 },
      amazon:     { regularPrice: 52.80, salePrice: 56.10, phaseOffset: 2, packQty: 12, packLabel: '12 × 1L' },
    }
  },
  {
    id: 'soy-sauce-gluten-free', sku: '9302572837628', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102084.jpg', name: 'Soy Sauce Gluten Free', size: '250ml', brand: 'Kikkoman',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 1 },
      coles:      { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 3 },
      amazon:     { regularPrice: 43.20, salePrice: 35.70, phaseOffset: 2, packQty: 12, packLabel: '12 × 250ml' },
    }
  },
  {
    id: 'tomato-paste-squeeze', sku: '9302544442587', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102061.jpg', name: 'Tomato Paste Squeeze', size: '500g', brand: 'Leggos',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 1 },
      coles:      { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'canned-sweet-corn-kernels', sku: '9303079010098', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102494.jpg', name: 'Canned Sweet Corn Kernels', size: '420g', brand: 'Edgell',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.00, salePrice: 1.50, phaseOffset: 0 },
      coles:      { regularPrice: 2.00, salePrice: 1.50, phaseOffset: 2 },
      amazon:     { regularPrice: 19.20, salePrice: 15.30, phaseOffset: 1, packQty: 12, packLabel: '12 × 420g' },
    }
  },
  {
    id: 'chunky-tuna-in-olive-oil', sku: '9302913578120', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102360.jpg', name: 'Chunky Tuna in Olive Oil', size: '95g', brand: 'John West',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 1.80, phaseOffset: 4 },
      coles:      { regularPrice: 2.80, salePrice: 1.80, phaseOffset: 2 },
      amazon:     { regularPrice: 26.88, salePrice: 18.36, phaseOffset: 1, packQty: 12, packLabel: '12 × 95g' },
    }
  },
  {
    id: 'tuna-tempters-springwater', sku: '9303234565540', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102620.jpg', name: 'Tuna Tempters Springwater', size: '95g', brand: 'Sirena',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.00, salePrice: 2.00, phaseOffset: 0 },
      coles:      { regularPrice: 3.00, salePrice: 2.00, phaseOffset: 2 },
      amazon:     { regularPrice: 28.80, salePrice: 20.40, phaseOffset: 1, packQty: 12, packLabel: '12 × 95g' },
    }
  },
  {
    id: 'crunchy-peanut-butter', sku: '9302677775823', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102169.jpg', name: 'Crunchy Peanut Butter', size: '375g', brand: 'Bega',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 4 },
      coles:      { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 1 },
      amazon:     { regularPrice: 55.68, salePrice: 40.80, phaseOffset: 0, packQty: 12, packLabel: '12 × 375g' },
    }
  },
  {
    id: 'smooth-peanut-butter-jar', sku: '9303003701511', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102433.jpg', name: 'Smooth Peanut Butter Jar', size: '375g', brand: 'Bega',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 3 },
      coles:      { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 0 },
      amazon:     { regularPrice: 55.68, salePrice: 40.80, phaseOffset: 4, packQty: 12, packLabel: '12 × 375g' },
    }
  },
  {
    id: 'strawberry-jam-spread', sku: '9302654319050', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102150.jpg', name: 'Strawberry Jam Spread', size: '480g', brand: 'IXL',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'pure-honey-squeeze-bottle', sku: '9303143207582', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102546.jpg', name: 'Pure Honey Squeeze Bottle', size: '340g', brand: 'Capilano',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 0 },
      coles:      { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 2 },
      amazon:     { regularPrice: 62.40, salePrice: 51.00, phaseOffset: 1, packQty: 12, packLabel: '12 × 340g' },
    }
  },
  {
    id: 'whole-egg-mayonnaise-jar', sku: '9302935800326', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102378.jpg', name: 'Whole Egg Mayonnaise Jar', size: '380g', brand: 'Praise',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 2 },
      amazon:     { regularPrice: 52.80, salePrice: 38.76, phaseOffset: 1, packQty: 12, packLabel: '12 × 380g' },
    }
  },
  {
    id: 'traditional-tomato-pasta-sauce', sku: '9303753083680', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103040.jpg', name: 'Traditional Tomato Pasta Sauce', size: '500g', brand: 'Dolmio',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.80, salePrice: 2.50, phaseOffset: 1 },
      coles:      { regularPrice: 3.80, salePrice: 2.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'spaghetti-pasta-no-5', sku: '9302364195805', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101915.jpg', name: 'Spaghetti Pasta No 5', size: '500g', brand: 'San Remo',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 1 },
      coles:      { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 3 },
      amazon:     { regularPrice: 26.88, salePrice: 20.40, phaseOffset: 2, packQty: 12, packLabel: '12 × 500g' },
    }
  },
  {
    id: 'penne-rigate-pasta', sku: '9302218516899', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101797.jpg', name: 'Penne Rigate Pasta', size: '500g', brand: 'San Remo',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 4 },
      coles:      { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 1 },
      amazon:     { regularPrice: 26.88, salePrice: 20.40, phaseOffset: 0, packQty: 12, packLabel: '12 × 500g' },
    }
  },
  {
    id: 'canned-chickpeas-drained', sku: '9302929627491', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102373.jpg', name: 'Canned Chickpeas drained', size: '400g', brand: 'Annalisa',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 1.80, salePrice: 1.30, phaseOffset: 4 },
      coles:      { regularPrice: 1.80, salePrice: 1.30, phaseOffset: 2 },
      amazon:     { regularPrice: 17.28, salePrice: 13.26, phaseOffset: 1, packQty: 12, packLabel: '12 × 400g' },
    }
  },
  {
    id: 'canned-brown-lentils', sku: '9302496294474', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102022.jpg', name: 'Canned Brown Lentils', size: '400g', brand: 'Annalisa',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 1.80, salePrice: 1.30, phaseOffset: 0 },
      coles:      { regularPrice: 1.80, salePrice: 1.30, phaseOffset: 2 },
      amazon:     { regularPrice: 17.28, salePrice: 13.26, phaseOffset: 1, packQty: 12, packLabel: '12 × 400g' },
    }
  },
  {
    id: 'table-salt-fine-iodised', sku: '9302772837482', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102246.jpg', name: 'Table Salt Fine iodised', size: '500g', brand: 'Saxons',
    category: 'pantry', emoji: '🥫', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.20, salePrice: 2.20, phaseOffset: 4 },
      coles:      { regularPrice: 2.20, salePrice: 2.20, phaseOffset: 6 },
      amazon:     { regularPrice: 21.12, salePrice: 22.44, phaseOffset: 5, packQty: 12, packLabel: '12 × 500g' },
    }
  },
  {
    id: 'black-pepper-grinder', sku: '9302466664866', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101998.jpg', name: 'Black Pepper Grinder', size: '50g', brand: 'MasterFoods',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 1 },
      coles:      { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 3 },
      amazon:     { regularPrice: 43.20, salePrice: 35.70, phaseOffset: 2, packQty: 12, packLabel: '12 × 50g' },
    }
  },
  {
    id: 'dijon-mustard-jar', sku: '9302107405869', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101707.jpg', name: 'Dijon Mustard Jar', size: '200g', brand: 'Maille',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 4 },
      coles:      { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 1 },
      amazon:     { regularPrice: 46.08, salePrice: 38.76, phaseOffset: 0, packQty: 12, packLabel: '12 × 200g' },
    }
  },
  {
    id: 'tomato-ketchup-bottle', sku: '9302661726452', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102156.jpg', name: 'Tomato Ketchup Bottle', size: '500ml', brand: 'Heinz',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 3 },
      coles:      { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 1 },
      amazon:     null,
    }
  },
  {
    id: 'barbecue-sauce-squeeze', sku: '9302733331338', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102214.jpg', name: 'Barbecue Sauce Squeeze', size: '500ml', brand: 'MasterFoods',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.20, salePrice: 3.00, phaseOffset: 1 },
      coles:      { regularPrice: 4.20, salePrice: 3.00, phaseOffset: 3 },
      amazon:     { regularPrice: 40.32, salePrice: 30.60, phaseOffset: 2, packQty: 12, packLabel: '12 × 500ml' },
    }
  },
  {
    id: 'sweet-chilli-sauce', sku: '9302222220600', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101800.jpg', name: 'Sweet Chilli Sauce', size: '250ml', brand: 'Fountain',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 3 },
      coles:      { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 1 },
      amazon:     { regularPrice: 33.60, salePrice: 25.50, phaseOffset: 0, packQty: 12, packLabel: '12 × 250ml' },
    }
  },
  {
    id: 'baked-beans-in-tomato-sauce', sku: '9303219750736', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102608.jpg', name: 'Baked Beans in Tomato Sauce', size: '300g', brand: 'Heinz',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.20, salePrice: 1.60, phaseOffset: 4 },
      coles:      { regularPrice: 2.20, salePrice: 1.60, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'packham-pears-fresh', sku: '9302333331630', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101890.jpg', name: 'Packham Pears Fresh', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 4.80, phaseOffset: 2 },
      coles:      { regularPrice: 4.80, salePrice: 4.80, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'yellow-peaches-sweet', sku: '9302517282113', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102039.jpg', name: 'Yellow Peaches Sweet', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 0 },
      coles:      { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 2 },
      amazon:     { regularPrice: 5.20, salePrice: 4.25, phaseOffset: 1, packQty: 1, packLabel: '1 × 1kg' },
    }
  },
  {
    id: 'navel-oranges-juicy', sku: '9302374072341', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101923.jpg', name: 'Navel Oranges Juicy', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 1 },
      coles:      { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 3 },
      amazon:     { regularPrice: 3.60, salePrice: 3.82, phaseOffset: 2, packQty: 1, packLabel: '1 × 1kg' },
    }
  },
  {
    id: 'imperial-mandarins-bag', sku: '9302711109132', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102196.jpg', name: 'Imperial Mandarins Bag', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 3 },
      coles:      { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 0 },
      amazon:     { regularPrice: 4.40, salePrice: 3.40, phaseOffset: 4, packQty: 1, packLabel: '1 × 1kg' },
    }
  },
  {
    id: 'lemons-fresh-bunch', sku: '9302232097136', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101808.jpg', name: 'Lemons Fresh Bunch', size: '500g', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.80, salePrice: 3.80, phaseOffset: 2 },
      coles:      { regularPrice: 3.80, salePrice: 3.80, phaseOffset: 4 },
      amazon:     { regularPrice: 3.04, salePrice: 3.23, phaseOffset: 3, packQty: 1, packLabel: '1 × 500g' },
    }
  },
  {
    id: 'limes-fresh-bag', sku: '9301804936954', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101462.jpg', name: 'Limes Fresh Bag', size: '500g', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 2 },
      coles:      { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 4 },
      amazon:     { regularPrice: 3.60, salePrice: 3.82, phaseOffset: 3, packQty: 1, packLabel: '1 × 500g' },
    }
  },
  {
    id: 'blueberries-fresh-tub', sku: '9302628393143', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102129.jpg', name: 'Blueberries Fresh Tub', size: '125g', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 1 },
      coles:      { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 3 },
      amazon:     { regularPrice: 4.40, salePrice: 2.98, phaseOffset: 2, packQty: 1, packLabel: '1 × 125g' },
    }
  },
  {
    id: 'raspberries-fresh-punnet', sku: '9303059257026', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102478.jpg', name: 'Raspberries Fresh Punnet', size: '125g', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 4.00, phaseOffset: 1 },
      coles:      { regularPrice: 6.00, salePrice: 4.00, phaseOffset: 3 },
      amazon:     { regularPrice: 4.80, salePrice: 3.40, phaseOffset: 2, packQty: 1, packLabel: '1 × 125g' },
    }
  },
  {
    id: 'fresh-ginger-root', sku: '9302116047838', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101714.jpg', name: 'Fresh Ginger Root', size: '150g', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 2 },
      coles:      { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 4 },
      amazon:     { regularPrice: 3.60, salePrice: 3.82, phaseOffset: 3, packQty: 1, packLabel: '1 × 150g' },
    }
  },
  {
    id: 'garlic-cloves-bag', sku: '9302056788622', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101666.jpg', name: 'Garlic Cloves Bag', size: '300g', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 3.50, salePrice: 3.50, phaseOffset: 2 },
      amazon:     { regularPrice: 2.80, salePrice: 2.98, phaseOffset: 1, packQty: 1, packLabel: '1 × 300g' },
    }
  },
  {
    id: 'butternut-pumpkin-whole', sku: '9302975306470', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102410.jpg', name: 'Butternut Pumpkin Whole', size: 'Each', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 0 },
      coles:      { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 2 },
      amazon:     { regularPrice: 3.20, salePrice: 2.55, phaseOffset: 1, packQty: 1, packLabel: '1 × Each' },
    }
  },
  {
    id: 'green-zucchini-fresh', sku: '9302488887072', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102016.jpg', name: 'Green Zucchini Fresh', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 5.50, phaseOffset: 3 },
      coles:      { regularPrice: 5.50, salePrice: 5.50, phaseOffset: 5 },
      amazon:     { regularPrice: 4.40, salePrice: 4.67, phaseOffset: 4, packQty: 1, packLabel: '1 × 1kg' },
    }
  },
  {
    id: 'button-mushrooms-cup', sku: '9302581479597', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102091.jpg', name: 'Button Mushrooms Cup', size: '200g', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 0 },
      coles:      { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 2 },
      amazon:     { regularPrice: 3.20, salePrice: 2.55, phaseOffset: 1, packQty: 1, packLabel: '1 × 200g' },
    }
  },
  {
    id: 'fresh-beetroot-bunch', sku: '9302496294474', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102022.jpg', name: 'Fresh Beetroot Bunch', size: 'Each', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 3.50, phaseOffset: 2 },
      coles:      { regularPrice: 3.50, salePrice: 3.50, phaseOffset: 4 },
      amazon:     { regularPrice: 2.80, salePrice: 2.98, phaseOffset: 3, packQty: 1, packLabel: '1 × Each' },
    }
  },
  {
    id: 'lebanese-cucumbers', sku: '9302277776115', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101845.jpg', name: 'Lebanese Cucumbers', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 4.80, phaseOffset: 2 },
      coles:      { regularPrice: 4.80, salePrice: 4.80, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'roma-tomatoes-fresh', sku: '9302386418011', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101933.jpg', name: 'Roma Tomatoes Fresh', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.80, salePrice: 5.80, phaseOffset: 4 },
      coles:      { regularPrice: 5.80, salePrice: 5.80, phaseOffset: 6 },
      amazon:     null,
    }
  },
  {
    id: 'red-onions-loose', sku: '9301991356571', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101613.jpg', name: 'Red Onions Loose', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 3.50, phaseOffset: 2 },
      coles:      { regularPrice: 3.50, salePrice: 3.50, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'rump-steak-grassfed', sku: '9302376541475', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101925.jpg', name: 'Rump Steak Grassfed', size: '500g', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 16.00, salePrice: 16.00, phaseOffset: 0 },
      coles:      { regularPrice: 16.00, salePrice: 16.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'ribeye-steak-premium', sku: '9302509874711', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102033.jpg', name: 'Ribeye Steak Premium', size: '400g', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 22.00, salePrice: 22.00, phaseOffset: 3 },
      coles:      { regularPrice: 22.00, salePrice: 22.00, phaseOffset: 5 },
      amazon:     null,
    }
  },
  {
    id: 'free-range-chicken-breast', sku: '9303017281748', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102444.jpg', name: 'Free Range Chicken Breast', size: '1kg', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 16.50, salePrice: 16.50, phaseOffset: 4 },
      coles:      { regularPrice: 16.50, salePrice: 16.50, phaseOffset: 6 },
      amazon:     null,
    }
  },
  {
    id: 'chicken-wings-bulk', sku: '9302218516899', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101797.jpg', name: 'Chicken Wings Bulk', size: '1kg', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 6.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.50, salePrice: 6.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'pork-chops-loin-bone-in', sku: '9302758022678', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102234.jpg', name: 'Pork Chops Loin bone-in', size: '1kg', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 15.00, salePrice: 15.00, phaseOffset: 3 },
      coles:      { regularPrice: 15.00, salePrice: 15.00, phaseOffset: 5 },
      amazon:     null,
    }
  },
  {
    id: 'lamb-chops-loin', sku: '9301823455459', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101477.jpg', name: 'Lamb Chops Loin', size: '1kg', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 24.00, salePrice: 24.00, phaseOffset: 0 },
      coles:      { regularPrice: 24.00, salePrice: 24.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'tasmanian-salmon-fillets', sku: '9303025923717', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102451.jpg', name: 'Tasmanian Salmon Fillets', size: '400g', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 18.50, salePrice: 18.50, phaseOffset: 4 },
      coles:      { regularPrice: 18.50, salePrice: 18.50, phaseOffset: 6 },
      amazon:     null,
    }
  },
  {
    id: 'cooked-tiger-prawns-fresh', sku: '9303093824902', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102506.jpg', name: 'Cooked Tiger Prawns Fresh', size: '500g', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 22.00, salePrice: 22.00, phaseOffset: 2 },
      coles:      { regularPrice: 22.00, salePrice: 22.00, phaseOffset: 4 },
      amazon:     { regularPrice: 17.60, salePrice: 18.70, phaseOffset: 3, packQty: 1, packLabel: '1 × 500g' },
    }
  },
  {
    id: 'smoked-streaky-bacon', sku: '9302492590773', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102019.jpg', name: 'Smoked Streaky Bacon', size: '250g', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 4 },
      coles:      { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'beef-mince-premium-5-fat', sku: '9302766664647', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102241.jpg', name: 'Beef Mince Premium 5% Fat', size: '1kg', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 19.00, salePrice: 19.00, phaseOffset: 2 },
      coles:      { regularPrice: 19.00, salePrice: 19.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'pork-beef-sausages-thin', sku: '9302809874492', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102276.jpg', name: 'Pork & Beef Sausages Thin', size: '1.5kg', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 11.50, salePrice: 11.50, phaseOffset: 4 },
      coles:      { regularPrice: 11.50, salePrice: 11.50, phaseOffset: 6 },
      amazon:     null,
    }
  },
  {
    id: 'salted-butter-block', sku: '9302360492104', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101912.jpg', name: 'Salted Butter Block', size: '250g', brand: 'Devondale',
    category: 'dairy', emoji: '🥛', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 1 },
      coles:      { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 3 },
      amazon:     { regularPrice: 3.84, salePrice: 3.23, phaseOffset: 2, packQty: 1, packLabel: '1 × 250g' },
    }
  },
  {
    id: 'unsalted-butter-block', sku: '9302640738813', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102139.jpg', name: 'Unsalted Butter Block', size: '250g', brand: 'Devondale',
    category: 'dairy', emoji: '🥛', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 2 },
      amazon:     { regularPrice: 3.84, salePrice: 3.23, phaseOffset: 1, packQty: 1, packLabel: '1 × 250g' },
    }
  },
  {
    id: 'cheddar-cheese-block-tasty', sku: '9303159256953', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102559.jpg', name: 'Cheddar Cheese Block Tasty', size: '500g', brand: 'Bega',
    category: 'dairy', emoji: '🥛', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.50, salePrice: 7.50, phaseOffset: 0 },
      coles:      { regularPrice: 9.50, salePrice: 7.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'grated-parmesan-cheese', sku: '9302712343699', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102197.jpg', name: 'Grated Parmesan Cheese', size: '125g', brand: 'Perfect Italiano',
    category: 'dairy', emoji: '🥛', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 1 },
      coles:      { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'shredded-mozzarella-cheese', sku: '9303253084045', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102635.jpg', name: 'Shredded Mozzarella Cheese', size: '250g', brand: 'Perfect Italiano',
    category: 'dairy', emoji: '🥛', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 2 },
      coles:      { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'greek-style-yogurt-natural', sku: '9303287651921', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102663.jpg', name: 'Greek Style Yogurt Natural', size: '1kg', brand: 'Chobani',
    category: 'dairy', emoji: '🥛', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 0 },
      coles:      { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'light-sour-cream-tub', sku: '9302443208093', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101979.jpg', name: 'Light Sour Cream Tub', size: '250g', brand: 'Bulli',
    category: 'dairy', emoji: '🥛', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.20, salePrice: 2.50, phaseOffset: 1 },
      coles:      { regularPrice: 3.20, salePrice: 2.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'original-cream-cheese-tub', sku: '9303037034820', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102460.jpg', name: 'Original Cream Cheese Tub', size: '250g', brand: 'Philadelphia',
    category: 'dairy', emoji: '🥛', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.30, salePrice: 4.00, phaseOffset: 0 },
      coles:      { regularPrice: 5.30, salePrice: 4.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'almond-milk-unsweetened', sku: '9302895059615', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102345.jpg', name: 'Almond Milk Unsweetened', size: '1L', brand: 'Sanitarium',
    category: 'dairy', emoji: '🥛', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.80, salePrice: 2.80, phaseOffset: 3 },
      coles:      { regularPrice: 3.80, salePrice: 2.80, phaseOffset: 1 },
      amazon:     null,
    }
  },
  {
    id: 'soy-milk-original-active', sku: '9302962960800', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102400.jpg', name: 'Soy Milk Original Active', size: '1L', brand: 'Sanitarium',
    category: 'dairy', emoji: '🥛', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 2 },
      coles:      { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'sourdough-loaf-fresh', sku: '9302513578412', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102036.jpg', name: 'Sourdough Loaf Fresh', size: 'Each', brand: 'WW',
    category: 'bakery', emoji: '🥖', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 6.50, phaseOffset: 3 },
      coles:      { regularPrice: 6.50, salePrice: 6.50, phaseOffset: 5 },
      amazon:     { regularPrice: 5.20, salePrice: 5.52, phaseOffset: 4, packQty: 1, packLabel: '1 × Each' },
    }
  },
  {
    id: 'wholemeal-sliced-bread', sku: '9302698763462', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102186.jpg', name: 'Wholemeal Sliced Bread', size: '700g', brand: 'Tip Top',
    category: 'bakery', emoji: '🥖', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.20, salePrice: 3.20, phaseOffset: 2 },
      coles:      { regularPrice: 4.20, salePrice: 3.20, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'white-sliced-bread-toast', sku: '9302929627491', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102373.jpg', name: 'White Sliced Bread Toast', size: '700g', brand: 'Tip Top',
    category: 'bakery', emoji: '🥖', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.20, salePrice: 3.20, phaseOffset: 1 },
      coles:      { regularPrice: 4.20, salePrice: 3.20, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'golden-crumpets-toast-6pk', sku: '9303060491593', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102479.jpg', name: 'Golden Crumpets Toast 6pk', size: '6 Pack', brand: 'Golden',
    category: 'bakery', emoji: '🥖', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.00, salePrice: 2.80, phaseOffset: 2 },
      coles:      { regularPrice: 4.00, salePrice: 2.80, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'english-muffins-original', sku: '9303023454583', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102449.jpg', name: 'English Muffins Original', size: '6 Pack', brand: 'Tip Top',
    category: 'bakery', emoji: '🥖', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.00, salePrice: 3.50, phaseOffset: 2 },
      coles:      { regularPrice: 5.00, salePrice: 3.50, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'soft-tortilla-wraps-large', sku: '9303128392778', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102534.jpg', name: 'Soft Tortilla Wraps Large', size: '8 Pack', brand: 'Mission',
    category: 'bakery', emoji: '🥖', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 1 },
      coles:      { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 3 },
      amazon:     { regularPrice: 4.40, salePrice: 3.40, phaseOffset: 2, packQty: 1, packLabel: '1 × 8 Pack' },
    }
  },
  {
    id: 'frozen-baby-peas-bag', sku: '9302385183444', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101932.jpg', name: 'Frozen Baby Peas Bag', size: '1kg', brand: 'Birds Eye',
    category: 'frozen', emoji: '🍕', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 4.20, phaseOffset: 2 },
      coles:      { regularPrice: 5.50, salePrice: 4.20, phaseOffset: 4 },
      amazon:     { regularPrice: 4.40, salePrice: 3.57, phaseOffset: 3, packQty: 1, packLabel: '1 × 1kg' },
    }
  },
  {
    id: 'frozen-super-sweet-corn', sku: '9302888886780', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102340.jpg', name: 'Frozen Super Sweet Corn', size: '500g', brand: 'Birds Eye',
    category: 'frozen', emoji: '🍕', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.80, salePrice: 2.80, phaseOffset: 0 },
      coles:      { regularPrice: 3.80, salePrice: 2.80, phaseOffset: 2 },
      amazon:     { regularPrice: 3.04, salePrice: 2.38, phaseOffset: 1, packQty: 1, packLabel: '1 × 500g' },
    }
  },
  {
    id: 'classic-vanilla-ice-cream', sku: '9303013578047', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102441.jpg', name: 'Classic Vanilla Ice Cream', size: '2L', brand: 'Streets Blue Ribbon',
    category: 'frozen', emoji: '🍕', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.00, salePrice: 6.50, phaseOffset: 4 },
      coles:      { regularPrice: 9.00, salePrice: 6.50, phaseOffset: 1 },
      amazon:     null,
    }
  },
  {
    id: 'deep-pan-hawaiian-pizza', sku: '9302790121420', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102260.jpg', name: 'Deep Pan Hawaiian Pizza', size: '400g', brand: 'McCain',
    category: 'frozen', emoji: '🍕', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 1 },
      coles:      { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 3 },
      amazon:     { regularPrice: 6.00, salePrice: 4.67, phaseOffset: 2, packQty: 1, packLabel: '1 × 400g' },
    }
  },
  {
    id: 'frozen-mixed-berries-bag', sku: '9302933331192', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102376.jpg', name: 'Frozen Mixed Berries Bag', size: '300g', brand: 'Creative Gourmet',
    category: 'frozen', emoji: '🍕', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.80, salePrice: 4.50, phaseOffset: 4 },
      coles:      { regularPrice: 5.80, salePrice: 4.50, phaseOffset: 2 },
      amazon:     { regularPrice: 4.64, salePrice: 3.82, phaseOffset: 1, packQty: 1, packLabel: '1 × 300g' },
    }
  },
  {
    id: 'party-meat-pies-12pk', sku: '9302307405723', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101869.jpg', name: 'Party Meat Pies 12pk', size: '12 Pack', brand: 'FourNTwenty',
    category: 'frozen', emoji: '🍕', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.50, salePrice: 7.00, phaseOffset: 1 },
      coles:      { regularPrice: 9.50, salePrice: 7.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'party-sausage-rolls-12pk', sku: '9302856788038', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102314.jpg', name: 'Party Sausage Rolls 12pk', size: '12 Pack', brand: 'FourNTwenty',
    category: 'frozen', emoji: '🍕', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.50, salePrice: 7.00, phaseOffset: 1 },
      coles:      { regularPrice: 9.50, salePrice: 7.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'laundry-powder-sensitive', sku: '9303086417500', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102500.jpg', name: 'Laundry Powder Sensitive', size: '2kg', brand: 'Omo',
    category: 'household', emoji: '🧼', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 20.24, salePrice: 13.16, phaseOffset: 1 },
woolworths: { regularPrice: 22.00, salePrice: 11.00, phaseOffset: 3 },
      coles:      { regularPrice: 22.00, salePrice: 11.00, phaseOffset: 5 },
      amazon:     { regularPrice: 17.60, salePrice: 9.35, phaseOffset: 4, packQty: 1, packLabel: '1 × 2kg' },
    }
  },
  {
    id: 'fabric-softener-lavender', sku: '9302992590408', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102424.jpg', name: 'Fabric Softener Lavender', size: '1L', brand: 'Fluffy',
    category: 'household', emoji: '🧼', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 7.82, salePrice: 5.08, phaseOffset: 1 },
woolworths: { regularPrice: 8.50, salePrice: 5.50, phaseOffset: 3 },
      coles:      { regularPrice: 8.50, salePrice: 5.50, phaseOffset: 0 },
      amazon:     { regularPrice: 6.80, salePrice: 4.67, phaseOffset: 4, packQty: 1, packLabel: '1 × 1L' },
    }
  },
  {
    id: 'dishwashing-liquid-lemon', sku: '9303029627418', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102454.jpg', name: 'Dishwashing Liquid Lemon', size: '400ml', brand: 'Morning Fresh',
    category: 'household', emoji: '🧼', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 5.06, salePrice: 3.29, phaseOffset: 1 },
woolworths: { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 2 },
      coles:      { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 0 },
      amazon:     { regularPrice: 4.40, salePrice: 3.23, phaseOffset: 3, packQty: 1, packLabel: '1 × 400ml' },
    }
  },
  {
    id: 'glass-cleaner-spray', sku: '9302366664939', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101917.jpg', name: 'Glass Cleaner Spray', size: '500ml', brand: 'Windex',
    category: 'household', emoji: '🧼', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.34, salePrice: 3.47, phaseOffset: 1 },
woolworths: { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 4 },
      coles:      { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 1 },
      amazon:     { regularPrice: 4.64, salePrice: 3.40, phaseOffset: 0, packQty: 1, packLabel: '1 × 500ml' },
    }
  },
  {
    id: 'multi-purpose-spray-citrus', sku: '9303329627199', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102697.jpg', name: 'Multi Purpose Spray Citrus', size: '500ml', brand: 'Dettol',
    category: 'household', emoji: '🧼', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.98, salePrice: 3.89, phaseOffset: 1 },
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 1 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 3 },
      amazon:     { regularPrice: 5.20, salePrice: 3.82, phaseOffset: 2, packQty: 1, packLabel: '1 × 500ml' },
    }
  },
  {
    id: 'sponge-scrubbers-4pk', sku: '9302449380928', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101984.jpg', name: 'Sponge Scrubbers 4pk', size: '4 Pack', brand: 'Chux',
    category: 'household', emoji: '🧼', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 4.14, salePrice: 2.69, phaseOffset: 1 },
woolworths: { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 2 },
      coles:      { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 0 },
      amazon:     { regularPrice: 3.60, salePrice: 2.98, phaseOffset: 3, packQty: 1, packLabel: '1 × 4 Pack' },
    }
  },
  {
    id: 'medium-garbage-bags-30pk', sku: '9302740738740', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102220.jpg', name: 'Medium Garbage Bags 30pk', size: '30 Pack', brand: 'Glad',
    category: 'household', emoji: '🧼', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.52, salePrice: 3.59, phaseOffset: 1 },
woolworths: { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 2 },
      amazon:     { regularPrice: 4.80, salePrice: 3.82, phaseOffset: 1, packQty: 1, packLabel: '1 × 30 Pack' },
    }
  },
  {
    id: 'aluminium-foil-roll', sku: '9302387652578', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101934.jpg', name: 'Aluminium Foil Roll', size: '20m', brand: 'Glad',
    category: 'household', emoji: '🧼', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 4.42, salePrice: 2.87, phaseOffset: 1 },
woolworths: { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 1 },
      coles:      { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 3 },
      amazon:     { regularPrice: 3.84, salePrice: 3.23, phaseOffset: 2, packQty: 1, packLabel: '1 × 20m' },
    }
  },
  {
    id: 'cling-wrap-plastic-roll', sku: '9302833331265', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102295.jpg', name: 'Cling Wrap Plastic Roll', size: '30m', brand: 'Glad',
    category: 'household', emoji: '🧼', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 4.14, salePrice: 2.69, phaseOffset: 1 },
woolworths: { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 2 },
      amazon:     { regularPrice: 3.60, salePrice: 2.98, phaseOffset: 1, packQty: 1, packLabel: '1 × 30m' },
    }
  },
  {
    id: 'refreshing-body-wash-gel', sku: '9302939504027', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102381.jpg', name: 'Refreshing Body Wash Gel', size: '500ml', brand: 'Palmolive',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.98, salePrice: 3.89, phaseOffset: 1 },
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 2 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 4 },
      amazon:     { regularPrice: 5.20, salePrice: 3.82, phaseOffset: 3, packQty: 1, packLabel: '1 × 500ml' },
    }
  },
  {
    id: 'anti-dandruff-shampoo', sku: '9302616047473', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102119.jpg', name: 'Anti Dandruff Shampoo', size: '350ml', brand: 'Head & Shoulders',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 8.74, salePrice: 5.68, phaseOffset: 1 },
woolworths: { regularPrice: 9.50, salePrice: 6.50, phaseOffset: 3 },
      coles:      { regularPrice: 9.50, salePrice: 6.50, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'smooth-care-conditioner', sku: '9302899997883', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102349.jpg', name: 'Smooth Care Conditioner', size: '350ml', brand: 'Pantene',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 7.82, salePrice: 5.08, phaseOffset: 1 },
woolworths: { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 2 },
      coles:      { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 0 },
      amazon:     { regularPrice: 6.80, salePrice: 5.10, phaseOffset: 3, packQty: 1, packLabel: '1 × 350ml' },
    }
  },
  {
    id: 'antibacterial-hand-wash', sku: '9302838269533', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102299.jpg', name: 'Antibacterial Hand Wash', size: '250ml', brand: 'Dettol',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 3.68, salePrice: 2.39, phaseOffset: 1 },
woolworths: { regularPrice: 4.00, salePrice: 2.80, phaseOffset: 0 },
      coles:      { regularPrice: 4.00, salePrice: 2.80, phaseOffset: 2 },
      amazon:     { regularPrice: 3.20, salePrice: 2.38, phaseOffset: 1, packQty: 1, packLabel: '1 × 250ml' },
    }
  },
  {
    id: 'deodorant-spray-men-sport', sku: '9303138269314', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102542.jpg', name: 'Deodorant Spray Men Sport', size: '250ml', brand: 'Rexona',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 7.82, salePrice: 5.08, phaseOffset: 1 },
woolworths: { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 1 },
      coles:      { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 3 },
      amazon:     { regularPrice: 6.80, salePrice: 5.10, phaseOffset: 2, packQty: 1, packLabel: '1 × 250ml' },
    }
  },
  {
    id: 'roll-on-deodorant-women', sku: '9302848146069', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102307.jpg', name: 'Roll-on Deodorant Women', size: '50ml', brand: 'Nivea',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 4.42, salePrice: 2.87, phaseOffset: 1 },
woolworths: { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 4 },
      coles:      { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 2 },
      amazon:     { regularPrice: 3.84, salePrice: 2.98, phaseOffset: 1, packQty: 1, packLabel: '1 × 50ml' },
    }
  },
  {
    id: 'mach-3-razor-blades-4pk', sku: '9302577775896', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102088.jpg', name: 'Mach 3 Razor Blades 4pk', size: '4 Pack', brand: 'Gillette',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 16.56, salePrice: 10.76, phaseOffset: 1 },
woolworths: { regularPrice: 18.00, salePrice: 14.00, phaseOffset: 2 },
      coles:      { regularPrice: 18.00, salePrice: 14.00, phaseOffset: 4 },
      amazon:     { regularPrice: 14.40, salePrice: 11.90, phaseOffset: 3, packQty: 1, packLabel: '1 × 4 Pack' },
    }
  },
  {
    id: 'ultra-dry-nappies-size-3', sku: '9302855553471', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102313.jpg', name: 'Ultra Dry Nappies Size 3', size: '44 Pack', brand: 'Huggies',
    category: 'baby', emoji: '👶', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 17.02, salePrice: 11.06, phaseOffset: 1 },
woolworths: { regularPrice: 18.50, salePrice: 14.50, phaseOffset: 1 },
      coles:      { regularPrice: 18.50, salePrice: 14.50, phaseOffset: 3 },
      amazon:     { regularPrice: 14.80, salePrice: 12.32, phaseOffset: 2, packQty: 1, packLabel: '1 × 44 Pack' },
    }
  },
  {
    id: 'ultra-dry-nappies-size-4', sku: '9302856788038', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102314.jpg', name: 'Ultra Dry Nappies Size 4', size: '40 Pack', brand: 'Huggies',
    category: 'baby', emoji: '👶', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 17.02, salePrice: 11.06, phaseOffset: 1 },
woolworths: { regularPrice: 18.50, salePrice: 14.50, phaseOffset: 3 },
      coles:      { regularPrice: 18.50, salePrice: 14.50, phaseOffset: 0 },
      amazon:     { regularPrice: 14.80, salePrice: 12.32, phaseOffset: 4, packQty: 1, packLabel: '1 × 40 Pack' },
    }
  },
  {
    id: 'baby-gold-formula-stage-2', sku: '9302908639852', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102356.jpg', name: 'Baby Gold Formula Stage 2', size: '900g', brand: 'Karicare',
    category: 'baby', emoji: '👶', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 22.08, salePrice: 14.35, phaseOffset: 1 },
woolworths: { regularPrice: 24.00, salePrice: 20.00, phaseOffset: 3 },
      coles:      { regularPrice: 24.00, salePrice: 20.00, phaseOffset: 5 },
      amazon:     { regularPrice: 19.20, salePrice: 17.00, phaseOffset: 4, packQty: 1, packLabel: '1 × 900g' },
    }
  },
  {
    id: 'organic-baby-food-pouch', sku: '9302783948585', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102255.jpg', name: 'Organic Baby Food Pouch', size: '120g', brand: 'Raffertys Garden',
    category: 'baby', emoji: '👶', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 2.58, salePrice: 1.68, phaseOffset: 1 },
woolworths: { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 3 },
      coles:      { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 1 },
      amazon:     { regularPrice: 2.24, salePrice: 1.70, phaseOffset: 0, packQty: 1, packLabel: '1 × 120g' },
    }
  },
  {
    id: 'tear-free-baby-shampoo', sku: '9302659257318', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102154.jpg', name: 'Tear Free Baby Shampoo', size: '200ml', brand: 'Johnsons',
    category: 'baby', emoji: '👶', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.06, salePrice: 3.29, phaseOffset: 1 },
woolworths: { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 1 },
      coles:      { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'dog-food-beef-can', sku: '9301951850427', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101581.jpg', name: 'Dog Food Beef Can', size: '700g', brand: 'Pedigree',
    category: 'pet', emoji: '🐾', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 2 },
      coles:      { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'cat-treats-chicken-bites', sku: '9302920985522', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102366.jpg', name: 'Cat Treats Chicken Bites', size: '50g', brand: 'Dine',
    category: 'pet', emoji: '🐾', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 1 },
      coles:      { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'cat-litter-crystals-odour', sku: '9303141973015', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102545.jpg', name: 'Cat Litter Crystals Odour', size: '4kg', brand: 'Catsan',
    category: 'pet', emoji: '🐾', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 18.00, salePrice: 14.00, phaseOffset: 1 },
      coles:      { regularPrice: 18.00, salePrice: 14.00, phaseOffset: 3 },
      amazon:     { regularPrice: 14.40, salePrice: 11.90, phaseOffset: 2, packQty: 1, packLabel: '1 × 4kg' },
    }
  },
  {
    id: 'vitamin-c-effervescent', sku: '9302751849843', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102229.jpg', name: 'Vitamin C Effervescent', size: '30 Pack', brand: 'Cenovis',
    category: 'health', emoji: '💊', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 10.12, salePrice: 6.58, phaseOffset: 1 },
woolworths: { regularPrice: 11.00, salePrice: 7.50, phaseOffset: 4 },
      coles:      { regularPrice: 11.00, salePrice: 7.50, phaseOffset: 1 },
      amazon:     { regularPrice: 105.60, salePrice: 76.50, phaseOffset: 0, packQty: 12, packLabel: '12 × 30 Pack' },
    }
  },
  {
    id: 'multivitamins-50plus-60pk', sku: '9302955553398', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102394.jpg', name: 'Multivitamins 50+ 60pk', size: '60 Pack', brand: 'Centrum',
    category: 'health', emoji: '💊', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 22.08, salePrice: 14.35, phaseOffset: 1 },
woolworths: { regularPrice: 24.00, salePrice: 16.00, phaseOffset: 4 },
      coles:      { regularPrice: 24.00, salePrice: 16.00, phaseOffset: 0 },
      amazon:     { regularPrice: 230.40, salePrice: 163.20, phaseOffset: 5, packQty: 12, packLabel: '12 × 60 Pack' },
    }
  },
  {
    id: 'cough-lozenges-honey-lemon', sku: '9303241972942', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102626.jpg', name: 'Cough Lozenges Honey Lemon', size: '16 Pack', brand: 'Strepsils',
    category: 'health', emoji: '💊', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 7.82, salePrice: 5.08, phaseOffset: 1 },
woolworths: { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 2 },
      coles:      { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 4 },
      amazon:     { regularPrice: 81.60, salePrice: 61.20, phaseOffset: 3, packQty: 12, packLabel: '12 × 16 Pack' },
    }
  },
  {
    id: 'elastic-plastic-bandages', sku: '9302967899068', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102404.jpg', name: 'Elastic Plastic Bandages', size: '25 Pack', brand: 'Band-Aid',
    category: 'health', emoji: '💊', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 4.14, salePrice: 2.69, phaseOffset: 1 },
woolworths: { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 4 },
      coles:      { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 2 },
      amazon:     { regularPrice: 43.20, salePrice: 35.70, phaseOffset: 1, packQty: 12, packLabel: '12 × 25 Pack' },
    }
  },
  {
    id: 'plain-flour-premium', sku: '9302396294547', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101941.jpg', name: 'Plain Flour Premium', size: '2kg', brand: 'White Wings',
    category: 'baking', emoji: '🧁', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 3 },
      coles:      { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 0 },
      amazon:     { regularPrice: 3.84, salePrice: 2.98, phaseOffset: 4, packQty: 1, packLabel: '1 × 2kg' },
    }
  },
  {
    id: 'brown-sugar-soft-cane', sku: '9302572837628', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102084.jpg', name: 'Brown Sugar Soft Cane', size: '1kg', brand: 'CSR',
    category: 'baking', emoji: '🧁', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 4 },
      coles:      { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 6 },
      amazon:     { regularPrice: 3.60, salePrice: 3.82, phaseOffset: 5, packQty: 1, packLabel: '1 × 1kg' },
    }
  },
  {
    id: 'icing-sugar-mixture', sku: '9302395059980', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101940.jpg', name: 'Icing Sugar Mixture', size: '500g', brand: 'CSR',
    category: 'baking', emoji: '🧁', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.20, salePrice: 3.20, phaseOffset: 3 },
      coles:      { regularPrice: 3.20, salePrice: 3.20, phaseOffset: 5 },
      amazon:     { regularPrice: 2.56, salePrice: 2.72, phaseOffset: 4, packQty: 1, packLabel: '1 × 500g' },
    }
  },
  {
    id: 'baking-powder-tin', sku: '9302096294766', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101698.jpg', name: 'Baking Powder Tin', size: '125g', brand: 'McKenzies',
    category: 'baking', emoji: '🧁', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 2.20, phaseOffset: 2 },
      coles:      { regularPrice: 2.80, salePrice: 2.20, phaseOffset: 0 },
      amazon:     { regularPrice: 2.24, salePrice: 1.87, phaseOffset: 3, packQty: 1, packLabel: '1 × 125g' },
    }
  },
  {
    id: 'pure-vanilla-extract', sku: '9302518516680', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102040.jpg', name: 'Pure Vanilla Extract', size: '50ml', brand: 'Queen',
    category: 'baking', emoji: '🧁', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 8.50, salePrice: 6.50, phaseOffset: 1 },
      coles:      { regularPrice: 8.50, salePrice: 6.50, phaseOffset: 3 },
      amazon:     { regularPrice: 6.80, salePrice: 5.52, phaseOffset: 2, packQty: 1, packLabel: '1 × 50ml' },
    }
  },
  {
    id: 'dry-yeast-sachets-5pk-val1', sku: '9303032096552', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102456.jpg', name: 'Dry Yeast Sachets 5pk Val1', size: '5 Pack', brand: 'Lowan',
    category: 'baking', emoji: '🧁', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 1 },
      coles:      { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 3 },
      amazon:     { regularPrice: 3.20, salePrice: 2.55, phaseOffset: 2, packQty: 1, packLabel: '1 × 5 Pack' },
    }
  },
  {
    id: 'basmati-rice-premium-val1', sku: '9302999997810', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102430.jpg', name: 'Basmati Rice Premium Val1', size: '2kg', brand: 'SunRice',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 8.00, salePrice: 5.50, phaseOffset: 4 },
      coles:      { regularPrice: 8.00, salePrice: 5.50, phaseOffset: 1 },
      amazon:     { regularPrice: 76.80, salePrice: 56.10, phaseOffset: 0, packQty: 12, packLabel: '12 × 2kg' },
    }
  },
  {
    id: 'jasmine-rice-fragrant-val1', sku: '9303113577974', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102522.jpg', name: 'Jasmine Rice Fragrant Val1', size: '5kg', brand: 'SunRice',
    category: 'pantry', emoji: '🥫', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 18.00, salePrice: 10.00, phaseOffset: 3 },
      coles:      { regularPrice: 18.00, salePrice: 10.00, phaseOffset: 5 },
      amazon:     { regularPrice: 172.80, salePrice: 102.00, phaseOffset: 4, packQty: 12, packLabel: '12 × 5kg' },
    }
  },
  {
    id: 'extra-virgin-olive-oil-val1', sku: '9303237034674', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102622.jpg', name: 'Extra Virgin Olive Oil Val1', size: '750ml', brand: 'Cobram Estate',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 16.00, salePrice: 12.00, phaseOffset: 0 },
      coles:      { regularPrice: 16.00, salePrice: 12.00, phaseOffset: 2 },
      amazon:     { regularPrice: 153.60, salePrice: 122.40, phaseOffset: 1, packQty: 12, packLabel: '12 × 750ml' },
    }
  },
  {
    id: 'pure-canola-cooking-oil-val1', sku: '9303318516096', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102688.jpg', name: 'Pure Canola Cooking Oil Val1', size: '1L', brand: 'WW',
    category: 'pantry', emoji: '🥫', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 5.50, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 5.50, phaseOffset: 2 },
      amazon:     { regularPrice: 52.80, salePrice: 56.10, phaseOffset: 1, packQty: 12, packLabel: '12 × 1L' },
    }
  },
  {
    id: 'soy-sauce-gluten-free-val1', sku: '9303087652067', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102501.jpg', name: 'Soy Sauce Gluten Free Val1', size: '250ml', brand: 'Kikkoman',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 2 },
      amazon:     { regularPrice: 43.20, salePrice: 35.70, phaseOffset: 1, packQty: 12, packLabel: '12 × 250ml' },
    }
  },
  {
    id: 'tomato-paste-squeeze-val1', sku: '9303059257026', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102478.jpg', name: 'Tomato Paste Squeeze Val1', size: '500g', brand: 'Leggos',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 1 },
      coles:      { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'canned-sweet-corn-kernels-val1', sku: '9303593824537', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102911.jpg', name: 'Canned Sweet Corn Kernels Val1', size: '420g', brand: 'Edgell',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.00, salePrice: 1.50, phaseOffset: 1 },
      coles:      { regularPrice: 2.00, salePrice: 1.50, phaseOffset: 3 },
      amazon:     { regularPrice: 19.20, salePrice: 15.30, phaseOffset: 2, packQty: 12, packLabel: '12 × 420g' },
    }
  },
  {
    id: 'chunky-tuna-in-olive-oil-val1', sku: '9303428392559', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102777.jpg', name: 'Chunky Tuna in Olive Oil Val1', size: '95g', brand: 'John West',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 1.80, phaseOffset: 3 },
      coles:      { regularPrice: 2.80, salePrice: 1.80, phaseOffset: 1 },
      amazon:     { regularPrice: 26.88, salePrice: 18.36, phaseOffset: 0, packQty: 12, packLabel: '12 × 95g' },
    }
  },
  {
    id: 'tuna-tempters-springwater-val1', sku: '9303749379979', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103037.jpg', name: 'Tuna Tempters Springwater Val1', size: '95g', brand: 'Sirena',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.00, salePrice: 2.00, phaseOffset: 4 },
      coles:      { regularPrice: 3.00, salePrice: 2.00, phaseOffset: 1 },
      amazon:     { regularPrice: 28.80, salePrice: 20.40, phaseOffset: 0, packQty: 12, packLabel: '12 × 95g' },
    }
  },
  {
    id: 'crunchy-peanut-butter-val1', sku: '9303192590262', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102586.jpg', name: 'Crunchy Peanut Butter Val1', size: '375g', brand: 'Bega',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 0 },
      coles:      { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 2 },
      amazon:     { regularPrice: 55.68, salePrice: 40.80, phaseOffset: 1, packQty: 12, packLabel: '12 × 375g' },
    }
  },
  {
    id: 'smooth-peanut-butter-jar-val1', sku: '9303518515950', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102850.jpg', name: 'Smooth Peanut Butter Jar Val1', size: '375g', brand: 'Bega',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 3 },
      coles:      { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 0 },
      amazon:     { regularPrice: 55.68, salePrice: 40.80, phaseOffset: 4, packQty: 12, packLabel: '12 × 375g' },
    }
  },
  {
    id: 'strawberry-jam-spread-val1', sku: '9303169133489', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102567.jpg', name: 'Strawberry Jam Spread Val1', size: '480g', brand: 'IXL',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 3 },
      coles:      { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 1 },
      amazon:     null,
    }
  },
  {
    id: 'pure-honey-squeeze-bottle-val1', sku: '9303658022021', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102963.jpg', name: 'Pure Honey Squeeze Bottle Val1', size: '340g', brand: 'Capilano',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 4 },
      coles:      { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 1 },
      amazon:     { regularPrice: 62.40, salePrice: 51.00, phaseOffset: 0, packQty: 12, packLabel: '12 × 340g' },
    }
  },
  {
    id: 'whole-egg-mayonnaise-jar-val1', sku: '9303450614765', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102795.jpg', name: 'Whole Egg Mayonnaise Jar Val1', size: '380g', brand: 'Praise',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 3 },
      coles:      { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 1 },
      amazon:     { regularPrice: 52.80, salePrice: 38.76, phaseOffset: 0, packQty: 12, packLabel: '12 × 380g' },
    }
  },
  {
    id: 'traditional-tomato-pasta-sauce-val1', sku: '9304267898119', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103457.jpg', name: 'Traditional Tomato Pasta Sauce Val1', size: '500g', brand: 'Dolmio',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.80, salePrice: 2.50, phaseOffset: 4 },
      coles:      { regularPrice: 3.80, salePrice: 2.50, phaseOffset: 1 },
      amazon:     null,
    }
  },
  {
    id: 'spaghetti-pasta-no-5-val1', sku: '9302879010244', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102332.jpg', name: 'Spaghetti Pasta No 5 Val1', size: '500g', brand: 'San Remo',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 2 },
      coles:      { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 4 },
      amazon:     { regularPrice: 26.88, salePrice: 20.40, phaseOffset: 3, packQty: 12, packLabel: '12 × 500g' },
    }
  },
  {
    id: 'penne-rigate-pasta-val1', sku: '9302733331338', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102214.jpg', name: 'Penne Rigate Pasta Val1', size: '500g', brand: 'San Remo',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 4 },
      coles:      { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 1 },
      amazon:     { regularPrice: 26.88, salePrice: 20.40, phaseOffset: 0, packQty: 12, packLabel: '12 × 500g' },
    }
  },
  {
    id: 'canned-chickpeas-drained-val1', sku: '9303444441930', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102790.jpg', name: 'Canned Chickpeas drained Val1', size: '400g', brand: 'Annalisa',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 1.80, salePrice: 1.30, phaseOffset: 0 },
      coles:      { regularPrice: 1.80, salePrice: 1.30, phaseOffset: 2 },
      amazon:     { regularPrice: 17.28, salePrice: 13.26, phaseOffset: 1, packQty: 12, packLabel: '12 × 400g' },
    }
  },
  {
    id: 'canned-brown-lentils-val1', sku: '9303011108913', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102439.jpg', name: 'Canned Brown Lentils Val1', size: '400g', brand: 'Annalisa',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 1.80, salePrice: 1.30, phaseOffset: 0 },
      coles:      { regularPrice: 1.80, salePrice: 1.30, phaseOffset: 2 },
      amazon:     { regularPrice: 17.28, salePrice: 13.26, phaseOffset: 1, packQty: 12, packLabel: '12 × 400g' },
    }
  },
  {
    id: 'table-salt-fine-iodised-val1', sku: '9303287651921', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102663.jpg', name: 'Table Salt Fine iodised Val1', size: '500g', brand: 'Saxons',
    category: 'pantry', emoji: '🥫', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.20, salePrice: 2.20, phaseOffset: 4 },
      coles:      { regularPrice: 2.20, salePrice: 2.20, phaseOffset: 6 },
      amazon:     { regularPrice: 21.12, salePrice: 22.44, phaseOffset: 5, packQty: 12, packLabel: '12 × 500g' },
    }
  },
  {
    id: 'black-pepper-grinder-val1', sku: '9302981479305', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102415.jpg', name: 'Black Pepper Grinder Val1', size: '50g', brand: 'MasterFoods',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 2 },
      coles:      { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 4 },
      amazon:     { regularPrice: 43.20, salePrice: 35.70, phaseOffset: 3, packQty: 12, packLabel: '12 × 50g' },
    }
  },
  {
    id: 'dijon-mustard-jar-val1', sku: '9302622220308', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102124.jpg', name: 'Dijon Mustard Jar Val1', size: '200g', brand: 'Maille',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 2 },
      coles:      { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 4 },
      amazon:     { regularPrice: 46.08, salePrice: 38.76, phaseOffset: 3, packQty: 12, packLabel: '12 × 200g' },
    }
  },
  {
    id: 'tomato-ketchup-bottle-val1', sku: '9303176540891', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102573.jpg', name: 'Tomato Ketchup Bottle Val1', size: '500ml', brand: 'Heinz',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 3.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'barbecue-sauce-squeeze-val1', sku: '9303248145777', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102631.jpg', name: 'Barbecue Sauce Squeeze Val1', size: '500ml', brand: 'MasterFoods',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.20, salePrice: 3.00, phaseOffset: 2 },
      coles:      { regularPrice: 4.20, salePrice: 3.00, phaseOffset: 4 },
      amazon:     { regularPrice: 40.32, salePrice: 30.60, phaseOffset: 3, packQty: 12, packLabel: '12 × 500ml' },
    }
  },
  {
    id: 'sweet-chilli-sauce-val1', sku: '9302737035039', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102217.jpg', name: 'Sweet Chilli Sauce Val1', size: '250ml', brand: 'Fountain',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 3 },
      coles:      { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 1 },
      amazon:     { regularPrice: 33.60, salePrice: 25.50, phaseOffset: 0, packQty: 12, packLabel: '12 × 250ml' },
    }
  },
  {
    id: 'baked-beans-in-tomato-sauce-val1', sku: '9303734565175', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103025.jpg', name: 'Baked Beans in Tomato Sauce Val1', size: '300g', brand: 'Heinz',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.20, salePrice: 1.60, phaseOffset: 1 },
      coles:      { regularPrice: 2.20, salePrice: 1.60, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'packham-pears-fresh-val1', sku: '9302848146069', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102307.jpg', name: 'Packham Pears Fresh Val1', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 4.80, phaseOffset: 3 },
      coles:      { regularPrice: 4.80, salePrice: 4.80, phaseOffset: 5 },
      amazon:     null,
    }
  },
  {
    id: 'yellow-peaches-sweet-val1', sku: '9303032096552', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102456.jpg', name: 'Yellow Peaches Sweet Val1', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 0 },
      coles:      { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 2 },
      amazon:     { regularPrice: 5.20, salePrice: 4.25, phaseOffset: 1, packQty: 1, packLabel: '1 × 1kg' },
    }
  },
  {
    id: 'navel-oranges-juicy-val1', sku: '9302888886780', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102340.jpg', name: 'Navel Oranges Juicy Val1', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 2 },
      coles:      { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 4 },
      amazon:     { regularPrice: 3.60, salePrice: 3.82, phaseOffset: 3, packQty: 1, packLabel: '1 × 1kg' },
    }
  },
  {
    id: 'imperial-mandarins-bag-val1', sku: '9303225923571', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102613.jpg', name: 'Imperial Mandarins Bag Val1', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 4 },
      coles:      { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 1 },
      amazon:     { regularPrice: 4.40, salePrice: 3.40, phaseOffset: 0, packQty: 1, packLabel: '1 × 1kg' },
    }
  },
  {
    id: 'lemons-fresh-bunch-val1', sku: '9302746911575', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102225.jpg', name: 'Lemons Fresh Bunch Val1', size: '500g', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.80, salePrice: 3.80, phaseOffset: 1 },
      coles:      { regularPrice: 3.80, salePrice: 3.80, phaseOffset: 3 },
      amazon:     { regularPrice: 3.04, salePrice: 3.23, phaseOffset: 2, packQty: 1, packLabel: '1 × 500g' },
    }
  },
  {
    id: 'limes-fresh-bag-val1', sku: '9302319751393', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101879.jpg', name: 'Limes Fresh Bag Val1', size: '500g', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 4 },
      coles:      { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 6 },
      amazon:     { regularPrice: 3.60, salePrice: 3.82, phaseOffset: 5, packQty: 1, packLabel: '1 × 500g' },
    }
  },
  {
    id: 'blueberries-fresh-tub-val1', sku: '9303143207582', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102546.jpg', name: 'Blueberries Fresh Tub Val1', size: '125g', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 5.50, salePrice: 3.50, phaseOffset: 2 },
      amazon:     { regularPrice: 4.40, salePrice: 2.98, phaseOffset: 1, packQty: 1, packLabel: '1 × 125g' },
    }
  },
  {
    id: 'raspberries-fresh-punnet-val1', sku: '9303574071465', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102895.jpg', name: 'Raspberries Fresh Punnet Val1', size: '125g', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.00, salePrice: 4.00, phaseOffset: 2 },
      coles:      { regularPrice: 6.00, salePrice: 4.00, phaseOffset: 4 },
      amazon:     { regularPrice: 4.80, salePrice: 3.40, phaseOffset: 3, packQty: 1, packLabel: '1 × 125g' },
    }
  },
  {
    id: 'fresh-ginger-root-val1', sku: '9302630862277', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102131.jpg', name: 'Fresh Ginger Root Val1', size: '150g', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 4 },
      coles:      { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 6 },
      amazon:     { regularPrice: 3.60, salePrice: 3.82, phaseOffset: 5, packQty: 1, packLabel: '1 × 150g' },
    }
  },
  {
    id: 'garlic-cloves-bag-val1', sku: '9302571603061', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102083.jpg', name: 'Garlic Cloves Bag Val1', size: '300g', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 3.50, phaseOffset: 4 },
      coles:      { regularPrice: 3.50, salePrice: 3.50, phaseOffset: 6 },
      amazon:     { regularPrice: 2.80, salePrice: 2.98, phaseOffset: 5, packQty: 1, packLabel: '1 × 300g' },
    }
  },
  {
    id: 'butternut-pumpkin-whole-val1', sku: '9303490120909', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102827.jpg', name: 'Butternut Pumpkin Whole Val1', size: 'Each', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 1 },
      coles:      { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 3 },
      amazon:     { regularPrice: 3.20, salePrice: 2.55, phaseOffset: 2, packQty: 1, packLabel: '1 × Each' },
    }
  },
  {
    id: 'green-zucchini-fresh-val1', sku: '9303003701511', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102433.jpg', name: 'Green Zucchini Fresh Val1', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 5.50, phaseOffset: 1 },
      coles:      { regularPrice: 5.50, salePrice: 5.50, phaseOffset: 3 },
      amazon:     { regularPrice: 4.40, salePrice: 4.67, phaseOffset: 2, packQty: 1, packLabel: '1 × 1kg' },
    }
  },
  {
    id: 'button-mushrooms-cup-val1', sku: '9303096294036', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102508.jpg', name: 'Button Mushrooms Cup Val1', size: '200g', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 2 },
      coles:      { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 0 },
      amazon:     { regularPrice: 3.20, salePrice: 2.55, phaseOffset: 3, packQty: 1, packLabel: '1 × 200g' },
    }
  },
  {
    id: 'fresh-beetroot-bunch-val1', sku: '9303011108913', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102439.jpg', name: 'Fresh Beetroot Bunch Val1', size: 'Each', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 3.50, phaseOffset: 1 },
      coles:      { regularPrice: 3.50, salePrice: 3.50, phaseOffset: 3 },
      amazon:     { regularPrice: 2.80, salePrice: 2.98, phaseOffset: 2, packQty: 1, packLabel: '1 × Each' },
    }
  },
  {
    id: 'lebanese-cucumbers-val1', sku: '9302792590554', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102262.jpg', name: 'Lebanese Cucumbers Val1', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 4.80, phaseOffset: 4 },
      coles:      { regularPrice: 4.80, salePrice: 4.80, phaseOffset: 6 },
      amazon:     null,
    }
  },
  {
    id: 'roma-tomatoes-fresh-val1', sku: '9302901232450', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102350.jpg', name: 'Roma Tomatoes Fresh Val1', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.80, salePrice: 5.80, phaseOffset: 4 },
      coles:      { regularPrice: 5.80, salePrice: 5.80, phaseOffset: 6 },
      amazon:     null,
    }
  },
  {
    id: 'red-onions-loose-val1', sku: '9302506171010', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102030.jpg', name: 'Red Onions Loose Val1', size: '1kg', brand: 'Fresh',
    category: 'produce', emoji: '🍎', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 3.50, salePrice: 3.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'rump-steak-grassfed-val1', sku: '9302891355914', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102342.jpg', name: 'Rump Steak Grassfed Val1', size: '500g', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 16.00, salePrice: 16.00, phaseOffset: 4 },
      coles:      { regularPrice: 16.00, salePrice: 16.00, phaseOffset: 6 },
      amazon:     null,
    }
  },
  {
    id: 'ribeye-steak-premium-val1', sku: '9303024689150', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102450.jpg', name: 'Ribeye Steak Premium Val1', size: '400g', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 22.00, salePrice: 22.00, phaseOffset: 2 },
      coles:      { regularPrice: 22.00, salePrice: 22.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'free-range-chicken-breast-val1', sku: '9303532096187', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102861.jpg', name: 'Free Range Chicken Breast Val1', size: '1kg', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 16.50, salePrice: 16.50, phaseOffset: 3 },
      coles:      { regularPrice: 16.50, salePrice: 16.50, phaseOffset: 5 },
      amazon:     null,
    }
  },
  {
    id: 'chicken-wings-bulk-val1', sku: '9302733331338', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102214.jpg', name: 'Chicken Wings Bulk Val1', size: '1kg', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 6.50, phaseOffset: 0 },
      coles:      { regularPrice: 6.50, salePrice: 6.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'pork-chops-loin-bone-in-val1', sku: '9303272837117', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102651.jpg', name: 'Pork Chops Loin bone-in Val1', size: '1kg', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 15.00, salePrice: 15.00, phaseOffset: 0 },
      coles:      { regularPrice: 15.00, salePrice: 15.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'lamb-chops-loin-val1', sku: '9302338269898', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101894.jpg', name: 'Lamb Chops Loin Val1', size: '1kg', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 24.00, salePrice: 24.00, phaseOffset: 2 },
      coles:      { regularPrice: 24.00, salePrice: 24.00, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'tasmanian-salmon-fillets-val1', sku: '9303540738156', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102868.jpg', name: 'Tasmanian Salmon Fillets Val1', size: '400g', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 18.50, salePrice: 18.50, phaseOffset: 2 },
      coles:      { regularPrice: 18.50, salePrice: 18.50, phaseOffset: 4 },
      amazon:     null,
    }
  },
  {
    id: 'cooked-tiger-prawns-fresh-val1', sku: '9303608639341', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102923.jpg', name: 'Cooked Tiger Prawns Fresh Val1', size: '500g', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 22.00, salePrice: 22.00, phaseOffset: 1 },
      coles:      { regularPrice: 22.00, salePrice: 22.00, phaseOffset: 3 },
      amazon:     { regularPrice: 17.60, salePrice: 18.70, phaseOffset: 2, packQty: 1, packLabel: '1 × 500g' },
    }
  },
  {
    id: 'smoked-streaky-bacon-val1', sku: '9303007405212', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102436.jpg', name: 'Smoked Streaky Bacon Val1', size: '250g', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 0 },
      coles:      { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'beef-mince-premium-5-fat-val1', sku: '9303281479086', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102658.jpg', name: 'Beef Mince Premium 5% Fat Val1', size: '1kg', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 19.00, salePrice: 19.00, phaseOffset: 1 },
      coles:      { regularPrice: 19.00, salePrice: 19.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'pork-beef-sausages-thin-val1', sku: '9303324688931', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102693.jpg', name: 'Pork & Beef Sausages Thin Val1', size: '1.5kg', brand: 'WW',
    category: 'meat', emoji: '🥩', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 11.50, salePrice: 11.50, phaseOffset: 4 },
      coles:      { regularPrice: 11.50, salePrice: 11.50, phaseOffset: 6 },
      amazon:     null,
    }
  },
  {
    id: 'salted-butter-block-val1', sku: '9302875306543', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102329.jpg', name: 'Salted Butter Block Val1', size: '250g', brand: 'Devondale',
    category: 'dairy', emoji: '🥛', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 2 },
      amazon:     { regularPrice: 3.84, salePrice: 3.23, phaseOffset: 1, packQty: 1, packLabel: '1 × 250g' },
    }
  },
  {
    id: 'unsalted-butter-block-val1', sku: '9303155553252', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102556.jpg', name: 'Unsalted Butter Block Val1', size: '250g', brand: 'Devondale',
    category: 'dairy', emoji: '🥛', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 2 },
      amazon:     { regularPrice: 3.84, salePrice: 3.23, phaseOffset: 1, packQty: 1, packLabel: '1 × 250g' },
    }
  },
  {
    id: 'cheddar-cheese-block-tasty-val1', sku: '9303674071392', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102976.jpg', name: 'Cheddar Cheese Block Tasty Val1', size: '500g', brand: 'Bega',
    category: 'dairy', emoji: '🥛', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.50, salePrice: 7.50, phaseOffset: 3 },
      coles:      { regularPrice: 9.50, salePrice: 7.50, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'grated-parmesan-cheese-val1', sku: '9303227158138', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102614.jpg', name: 'Grated Parmesan Cheese Val1', size: '125g', brand: 'Perfect Italiano',
    category: 'dairy', emoji: '🥛', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'shredded-mozzarella-cheese-val1', sku: '9303767898484', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103052.jpg', name: 'Shredded Mozzarella Cheese Val1', size: '250g', brand: 'Perfect Italiano',
    category: 'dairy', emoji: '🥛', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 4 },
      coles:      { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 1 },
      amazon:     null,
    }
  },
  {
    id: 'greek-style-yogurt-natural-val1', sku: '9303802466360', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103080.jpg', name: 'Greek Style Yogurt Natural Val1', size: '1kg', brand: 'Chobani',
    category: 'dairy', emoji: '🥛', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 1 },
      coles:      { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'light-sour-cream-tub-val1', sku: '9302958022532', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102396.jpg', name: 'Light Sour Cream Tub Val1', size: '250g', brand: 'Bulli',
    category: 'dairy', emoji: '🥛', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.20, salePrice: 2.50, phaseOffset: 1 },
      coles:      { regularPrice: 3.20, salePrice: 2.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'original-cream-cheese-tub-val1', sku: '9303551849259', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102877.jpg', name: 'Original Cream Cheese Tub Val1', size: '250g', brand: 'Philadelphia',
    category: 'dairy', emoji: '🥛', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.30, salePrice: 4.00, phaseOffset: 3 },
      coles:      { regularPrice: 5.30, salePrice: 4.00, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'almond-milk-unsweetened-val1', sku: '9303409874054', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102762.jpg', name: 'Almond Milk Unsweetened Val1', size: '1L', brand: 'Sanitarium',
    category: 'dairy', emoji: '🥛', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.80, salePrice: 2.80, phaseOffset: 4 },
      coles:      { regularPrice: 3.80, salePrice: 2.80, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'soy-milk-original-active-val1', sku: '9303477775239', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102817.jpg', name: 'Soy Milk Original Active Val1', size: '1L', brand: 'Sanitarium',
    category: 'dairy', emoji: '🥛', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 1 },
      coles:      { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'sourdough-loaf-fresh-val1', sku: '9303028392851', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102453.jpg', name: 'Sourdough Loaf Fresh Val1', size: 'Each', brand: 'WW',
    category: 'bakery', emoji: '🥖', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 6.50, phaseOffset: 2 },
      coles:      { regularPrice: 6.50, salePrice: 6.50, phaseOffset: 4 },
      amazon:     { regularPrice: 5.20, salePrice: 5.52, phaseOffset: 3, packQty: 1, packLabel: '1 × Each' },
    }
  },
  {
    id: 'wholemeal-sliced-bread-val1', sku: '9303213577901', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102603.jpg', name: 'Wholemeal Sliced Bread Val1', size: '700g', brand: 'Tip Top',
    category: 'bakery', emoji: '🥖', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.20, salePrice: 3.20, phaseOffset: 4 },
      coles:      { regularPrice: 4.20, salePrice: 3.20, phaseOffset: 1 },
      amazon:     null,
    }
  },
  {
    id: 'white-sliced-bread-toast-val1', sku: '9303444441930', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102790.jpg', name: 'White Sliced Bread Toast Val1', size: '700g', brand: 'Tip Top',
    category: 'bakery', emoji: '🥖', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.20, salePrice: 3.20, phaseOffset: 4 },
      coles:      { regularPrice: 4.20, salePrice: 3.20, phaseOffset: 1 },
      amazon:     null,
    }
  },
  {
    id: 'golden-crumpets-toast-6pk-val1', sku: '9303575306032', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102896.jpg', name: 'Golden Crumpets Toast 6pk Val1', size: '6 Pack', brand: 'Golden',
    category: 'bakery', emoji: '🥖', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.00, salePrice: 2.80, phaseOffset: 3 },
      coles:      { regularPrice: 4.00, salePrice: 2.80, phaseOffset: 1 },
      amazon:     null,
    }
  },
  {
    id: 'english-muffins-original-val1', sku: '9303538269022', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102866.jpg', name: 'English Muffins Original Val1', size: '6 Pack', brand: 'Tip Top',
    category: 'bakery', emoji: '🥖', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.00, salePrice: 3.50, phaseOffset: 1 },
      coles:      { regularPrice: 5.00, salePrice: 3.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'soft-tortilla-wraps-large-val1', sku: '9303643207217', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102951.jpg', name: 'Soft Tortilla Wraps Large Val1', size: '8 Pack', brand: 'Mission',
    category: 'bakery', emoji: '🥖', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 4 },
      coles:      { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 2 },
      amazon:     { regularPrice: 4.40, salePrice: 3.40, phaseOffset: 1, packQty: 1, packLabel: '1 × 8 Pack' },
    }
  },
  {
    id: 'frozen-baby-peas-bag-val1', sku: '9302899997883', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102349.jpg', name: 'Frozen Baby Peas Bag Val1', size: '1kg', brand: 'Birds Eye',
    category: 'frozen', emoji: '🍕', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 4.20, phaseOffset: 1 },
      coles:      { regularPrice: 5.50, salePrice: 4.20, phaseOffset: 3 },
      amazon:     { regularPrice: 4.40, salePrice: 3.57, phaseOffset: 2, packQty: 1, packLabel: '1 × 1kg' },
    }
  },
  {
    id: 'frozen-super-sweet-corn-val1', sku: '9303403701219', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102757.jpg', name: 'Frozen Super Sweet Corn Val1', size: '500g', brand: 'Birds Eye',
    category: 'frozen', emoji: '🍕', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.80, salePrice: 2.80, phaseOffset: 2 },
      coles:      { regularPrice: 3.80, salePrice: 2.80, phaseOffset: 0 },
      amazon:     { regularPrice: 3.04, salePrice: 2.38, phaseOffset: 3, packQty: 1, packLabel: '1 × 500g' },
    }
  },
  {
    id: 'classic-vanilla-ice-cream-val1', sku: '9303528392486', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102858.jpg', name: 'Classic Vanilla Ice Cream Val1', size: '2L', brand: 'Streets Blue Ribbon',
    category: 'frozen', emoji: '🍕', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.00, salePrice: 6.50, phaseOffset: 3 },
      coles:      { regularPrice: 9.00, salePrice: 6.50, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'deep-pan-hawaiian-pizza-val1', sku: '9303304935859', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102677.jpg', name: 'Deep Pan Hawaiian Pizza Val1', size: '400g', brand: 'McCain',
    category: 'frozen', emoji: '🍕', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 2 },
      coles:      { regularPrice: 7.50, salePrice: 5.50, phaseOffset: 4 },
      amazon:     { regularPrice: 6.00, salePrice: 4.67, phaseOffset: 3, packQty: 1, packLabel: '1 × 400g' },
    }
  },
  {
    id: 'frozen-mixed-berries-bag-val1', sku: '9303448145631', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102793.jpg', name: 'Frozen Mixed Berries Bag Val1', size: '300g', brand: 'Creative Gourmet',
    category: 'frozen', emoji: '🍕', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.80, salePrice: 4.50, phaseOffset: 3 },
      coles:      { regularPrice: 5.80, salePrice: 4.50, phaseOffset: 1 },
      amazon:     { regularPrice: 4.64, salePrice: 3.82, phaseOffset: 0, packQty: 1, packLabel: '1 × 300g' },
    }
  },
  {
    id: 'party-meat-pies-12pk-val1', sku: '9302822220162', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102286.jpg', name: 'Party Meat Pies 12pk Val1', size: '12 Pack', brand: 'FourNTwenty',
    category: 'frozen', emoji: '🍕', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.50, salePrice: 7.00, phaseOffset: 4 },
      coles:      { regularPrice: 9.50, salePrice: 7.00, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'party-sausage-rolls-12pk-val1', sku: '9303371602477', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102731.jpg', name: 'Party Sausage Rolls 12pk Val1', size: '12 Pack', brand: 'FourNTwenty',
    category: 'frozen', emoji: '🍕', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 9.50, salePrice: 7.00, phaseOffset: 3 },
      coles:      { regularPrice: 9.50, salePrice: 7.00, phaseOffset: 5 },
      amazon:     null,
    }
  },
  {
    id: 'laundry-powder-sensitive-val1', sku: '9303601231939', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102917.jpg', name: 'Laundry Powder Sensitive Val1', size: '2kg', brand: 'Omo',
    category: 'household', emoji: '🧼', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 20.24, salePrice: 13.16, phaseOffset: 1 },
woolworths: { regularPrice: 22.00, salePrice: 11.00, phaseOffset: 0 },
      coles:      { regularPrice: 22.00, salePrice: 11.00, phaseOffset: 2 },
      amazon:     { regularPrice: 17.60, salePrice: 9.35, phaseOffset: 1, packQty: 1, packLabel: '1 × 2kg' },
    }
  },
  {
    id: 'fabric-softener-lavender-val1', sku: '9303507404847', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102841.jpg', name: 'Fabric Softener Lavender Val1', size: '1L', brand: 'Fluffy',
    category: 'household', emoji: '🧼', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 7.82, salePrice: 5.08, phaseOffset: 1 },
woolworths: { regularPrice: 8.50, salePrice: 5.50, phaseOffset: 1 },
      coles:      { regularPrice: 8.50, salePrice: 5.50, phaseOffset: 3 },
      amazon:     { regularPrice: 6.80, salePrice: 4.67, phaseOffset: 2, packQty: 1, packLabel: '1 × 1L' },
    }
  },
  {
    id: 'dishwashing-liquid-lemon-val1', sku: '9303544441857', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102871.jpg', name: 'Dishwashing Liquid Lemon Val1', size: '400ml', brand: 'Morning Fresh',
    category: 'household', emoji: '🧼', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 5.06, salePrice: 3.29, phaseOffset: 1 },
woolworths: { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 1 },
      coles:      { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 3 },
      amazon:     { regularPrice: 4.40, salePrice: 3.23, phaseOffset: 2, packQty: 1, packLabel: '1 × 400ml' },
    }
  },
  {
    id: 'glass-cleaner-spray-val1', sku: '9302881479378', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102334.jpg', name: 'Glass Cleaner Spray Val1', size: '500ml', brand: 'Windex',
    category: 'household', emoji: '🧼', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.34, salePrice: 3.47, phaseOffset: 1 },
woolworths: { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 0 },
      coles:      { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 2 },
      amazon:     { regularPrice: 4.64, salePrice: 3.40, phaseOffset: 1, packQty: 1, packLabel: '1 × 500ml' },
    }
  },
  {
    id: 'multi-purpose-spray-citrus-val1', sku: '9303844441638', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103114.jpg', name: 'Multi Purpose Spray Citrus Val1', size: '500ml', brand: 'Dettol',
    category: 'household', emoji: '🧼', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.98, salePrice: 3.89, phaseOffset: 1 },
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 2 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 4 },
      amazon:     { regularPrice: 5.20, salePrice: 3.82, phaseOffset: 3, packQty: 1, packLabel: '1 × 500ml' },
    }
  },
  {
    id: 'sponge-scrubbers-4pk-val1', sku: '9302964195367', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102401.jpg', name: 'Sponge Scrubbers 4pk Val1', size: '4 Pack', brand: 'Chux',
    category: 'household', emoji: '🧼', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 4.14, salePrice: 2.69, phaseOffset: 1 },
woolworths: { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 2 },
      amazon:     { regularPrice: 3.60, salePrice: 2.98, phaseOffset: 1, packQty: 1, packLabel: '1 × 4 Pack' },
    }
  },
  {
    id: 'medium-garbage-bags-30pk-val1', sku: '9303255553179', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102637.jpg', name: 'Medium Garbage Bags 30pk Val1', size: '30 Pack', brand: 'Glad',
    category: 'household', emoji: '🧼', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.52, salePrice: 3.59, phaseOffset: 1 },
woolworths: { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 4 },
      coles:      { regularPrice: 6.00, salePrice: 4.50, phaseOffset: 1 },
      amazon:     { regularPrice: 4.80, salePrice: 3.82, phaseOffset: 0, packQty: 1, packLabel: '1 × 30 Pack' },
    }
  },
  {
    id: 'aluminium-foil-roll-val1', sku: '9302902467017', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102351.jpg', name: 'Aluminium Foil Roll Val1', size: '20m', brand: 'Glad',
    category: 'household', emoji: '🧼', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 4.42, salePrice: 2.87, phaseOffset: 1 },
woolworths: { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 4 },
      coles:      { regularPrice: 4.80, salePrice: 3.80, phaseOffset: 2 },
      amazon:     { regularPrice: 3.84, salePrice: 3.23, phaseOffset: 1, packQty: 1, packLabel: '1 × 20m' },
    }
  },
  {
    id: 'cling-wrap-plastic-roll-val1', sku: '9303348145704', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102712.jpg', name: 'Cling Wrap Plastic Roll Val1', size: '30m', brand: 'Glad',
    category: 'household', emoji: '🧼', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 4.14, salePrice: 2.69, phaseOffset: 1 },
woolworths: { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 1 },
      coles:      { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 3 },
      amazon:     { regularPrice: 3.60, salePrice: 2.98, phaseOffset: 2, packQty: 1, packLabel: '1 × 30m' },
    }
  },
  {
    id: 'refreshing-body-wash-gel-val1', sku: '9303454318466', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102798.jpg', name: 'Refreshing Body Wash Gel Val1', size: '500ml', brand: 'Palmolive',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.98, salePrice: 3.89, phaseOffset: 1 },
woolworths: { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 4 },
      coles:      { regularPrice: 6.50, salePrice: 4.50, phaseOffset: 1 },
      amazon:     { regularPrice: 5.20, salePrice: 3.82, phaseOffset: 0, packQty: 1, packLabel: '1 × 500ml' },
    }
  },
  {
    id: 'anti-dandruff-shampoo-val1', sku: '9303130861912', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102536.jpg', name: 'Anti Dandruff Shampoo Val1', size: '350ml', brand: 'Head & Shoulders',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 8.74, salePrice: 5.68, phaseOffset: 1 },
woolworths: { regularPrice: 9.50, salePrice: 6.50, phaseOffset: 1 },
      coles:      { regularPrice: 9.50, salePrice: 6.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'smooth-care-conditioner-val1', sku: '9303414812322', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102766.jpg', name: 'Smooth Care Conditioner Val1', size: '350ml', brand: 'Pantene',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 7.82, salePrice: 5.08, phaseOffset: 1 },
woolworths: { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 0 },
      coles:      { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 2 },
      amazon:     { regularPrice: 6.80, salePrice: 5.10, phaseOffset: 1, packQty: 1, packLabel: '1 × 350ml' },
    }
  },
  {
    id: 'antibacterial-hand-wash-val1', sku: '9303353083972', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102716.jpg', name: 'Antibacterial Hand Wash Val1', size: '250ml', brand: 'Dettol',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 3.68, salePrice: 2.39, phaseOffset: 1 },
woolworths: { regularPrice: 4.00, salePrice: 2.80, phaseOffset: 0 },
      coles:      { regularPrice: 4.00, salePrice: 2.80, phaseOffset: 2 },
      amazon:     { regularPrice: 3.20, salePrice: 2.38, phaseOffset: 1, packQty: 1, packLabel: '1 × 250ml' },
    }
  },
  {
    id: 'deodorant-spray-men-sport-val1', sku: '9303653083753', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102959.jpg', name: 'Deodorant Spray Men Sport Val1', size: '250ml', brand: 'Rexona',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 7.82, salePrice: 5.08, phaseOffset: 1 },
woolworths: { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 0 },
      coles:      { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 2 },
      amazon:     { regularPrice: 6.80, salePrice: 5.10, phaseOffset: 1, packQty: 1, packLabel: '1 × 250ml' },
    }
  },
  {
    id: 'roll-on-deodorant-women-val1', sku: '9303362960508', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102724.jpg', name: 'Roll-on Deodorant Women Val1', size: '50ml', brand: 'Nivea',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 4.42, salePrice: 2.87, phaseOffset: 1 },
woolworths: { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 1 },
      coles:      { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 3 },
      amazon:     { regularPrice: 3.84, salePrice: 2.98, phaseOffset: 2, packQty: 1, packLabel: '1 × 50ml' },
    }
  },
  {
    id: 'mach-3-razor-blades-4pk-val1', sku: '9303092590335', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102505.jpg', name: 'Mach 3 Razor Blades 4pk Val1', size: '4 Pack', brand: 'Gillette',
    category: 'personal-care', emoji: '🧴', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 16.56, salePrice: 10.76, phaseOffset: 1 },
woolworths: { regularPrice: 18.00, salePrice: 14.00, phaseOffset: 0 },
      coles:      { regularPrice: 18.00, salePrice: 14.00, phaseOffset: 2 },
      amazon:     { regularPrice: 14.40, salePrice: 11.90, phaseOffset: 1, packQty: 1, packLabel: '1 × 4 Pack' },
    }
  },
  {
    id: 'ultra-dry-nappies-size-3-val1', sku: '9303370367910', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102730.jpg', name: 'Ultra Dry Nappies Size 3 Val1', size: '44 Pack', brand: 'Huggies',
    category: 'baby', emoji: '👶', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 17.02, salePrice: 11.06, phaseOffset: 1 },
woolworths: { regularPrice: 18.50, salePrice: 14.50, phaseOffset: 0 },
      coles:      { regularPrice: 18.50, salePrice: 14.50, phaseOffset: 2 },
      amazon:     { regularPrice: 14.80, salePrice: 12.32, phaseOffset: 1, packQty: 1, packLabel: '1 × 44 Pack' },
    }
  },
  {
    id: 'ultra-dry-nappies-size-4-val1', sku: '9303371602477', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102731.jpg', name: 'Ultra Dry Nappies Size 4 Val1', size: '40 Pack', brand: 'Huggies',
    category: 'baby', emoji: '👶', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 17.02, salePrice: 11.06, phaseOffset: 1 },
woolworths: { regularPrice: 18.50, salePrice: 14.50, phaseOffset: 2 },
      coles:      { regularPrice: 18.50, salePrice: 14.50, phaseOffset: 4 },
      amazon:     { regularPrice: 14.80, salePrice: 12.32, phaseOffset: 3, packQty: 1, packLabel: '1 × 40 Pack' },
    }
  },
  {
    id: 'baby-gold-formula-stage-2-val1', sku: '9303423454291', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102773.jpg', name: 'Baby Gold Formula Stage 2 Val1', size: '900g', brand: 'Karicare',
    category: 'baby', emoji: '👶', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 22.08, salePrice: 14.35, phaseOffset: 1 },
woolworths: { regularPrice: 24.00, salePrice: 20.00, phaseOffset: 0 },
      coles:      { regularPrice: 24.00, salePrice: 20.00, phaseOffset: 2 },
      amazon:     { regularPrice: 19.20, salePrice: 17.00, phaseOffset: 1, packQty: 1, packLabel: '1 × 900g' },
    }
  },
  {
    id: 'organic-baby-food-pouch-val1', sku: '9303298763024', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102672.jpg', name: 'Organic Baby Food Pouch Val1', size: '120g', brand: 'Raffertys Garden',
    category: 'baby', emoji: '👶', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 2.58, salePrice: 1.68, phaseOffset: 1 },
woolworths: { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 4 },
      coles:      { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 2 },
      amazon:     { regularPrice: 2.24, salePrice: 1.70, phaseOffset: 1, packQty: 1, packLabel: '1 × 120g' },
    }
  },
  {
    id: 'tear-free-baby-shampoo-val1', sku: '9303174071757', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102571.jpg', name: 'Tear Free Baby Shampoo Val1', size: '200ml', brand: 'Johnsons',
    category: 'baby', emoji: '👶', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 5.06, salePrice: 3.29, phaseOffset: 1 },
woolworths: { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 1 },
      coles:      { regularPrice: 5.50, salePrice: 4.00, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'dog-food-beef-can-val1', sku: '9302466664866', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/101998.jpg', name: 'Dog Food Beef Can Val1', size: '700g', brand: 'Pedigree',
    category: 'pet', emoji: '🐾', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 2 },
      coles:      { regularPrice: 3.50, salePrice: 2.50, phaseOffset: 0 },
      amazon:     null,
    }
  },
  {
    id: 'cat-treats-chicken-bites-val1', sku: '9303435799961', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102783.jpg', name: 'Cat Treats Chicken Bites Val1', size: '50g', brand: 'Dine',
    category: 'pet', emoji: '🐾', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 3 },
      coles:      { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 1 },
      amazon:     null,
    }
  },
  {
    id: 'cat-litter-crystals-odour-val1', sku: '9303656787454', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102962.jpg', name: 'Cat Litter Crystals Odour Val1', size: '4kg', brand: 'Catsan',
    category: 'pet', emoji: '🐾', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 18.00, salePrice: 14.00, phaseOffset: 1 },
      coles:      { regularPrice: 18.00, salePrice: 14.00, phaseOffset: 3 },
      amazon:     { regularPrice: 14.40, salePrice: 11.90, phaseOffset: 2, packQty: 1, packLabel: '1 × 4kg' },
    }
  },
  {
    id: 'vitamin-c-effervescent-val1', sku: '9303266664282', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102646.jpg', name: 'Vitamin C Effervescent Val1', size: '30 Pack', brand: 'Cenovis',
    category: 'health', emoji: '💊', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 10.12, salePrice: 6.58, phaseOffset: 1 },
woolworths: { regularPrice: 11.00, salePrice: 7.50, phaseOffset: 4 },
      coles:      { regularPrice: 11.00, salePrice: 7.50, phaseOffset: 1 },
      amazon:     { regularPrice: 105.60, salePrice: 76.50, phaseOffset: 0, packQty: 12, packLabel: '12 × 30 Pack' },
    }
  },
  {
    id: 'multivitamins-50plus-60pk-val1', sku: '9303470367837', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102811.jpg', name: 'Multivitamins 50+ 60pk Val1', size: '60 Pack', brand: 'Centrum',
    category: 'health', emoji: '💊', cycleWeeks: 6,
    stores: {
      chemist_warehouse: { regularPrice: 22.08, salePrice: 14.35, phaseOffset: 1 },
woolworths: { regularPrice: 24.00, salePrice: 16.00, phaseOffset: 1 },
      coles:      { regularPrice: 24.00, salePrice: 16.00, phaseOffset: 3 },
      amazon:     { regularPrice: 230.40, salePrice: 163.20, phaseOffset: 2, packQty: 12, packLabel: '12 × 60 Pack' },
    }
  },
  {
    id: 'cough-lozenges-honey-lemon-val1', sku: '9303756787381', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103043.jpg', name: 'Cough Lozenges Honey Lemon Val1', size: '16 Pack', brand: 'Strepsils',
    category: 'health', emoji: '💊', cycleWeeks: 5,
    stores: {
      chemist_warehouse: { regularPrice: 7.82, salePrice: 5.08, phaseOffset: 1 },
woolworths: { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 4 },
      coles:      { regularPrice: 8.50, salePrice: 6.00, phaseOffset: 1 },
      amazon:     { regularPrice: 81.60, salePrice: 61.20, phaseOffset: 0, packQty: 12, packLabel: '12 × 16 Pack' },
    }
  },
  {
    id: 'elastic-plastic-bandages-val1', sku: '9303482713507', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102821.jpg', name: 'Elastic Plastic Bandages Val1', size: '25 Pack', brand: 'Band-Aid',
    category: 'health', emoji: '💊', cycleWeeks: 4,
    stores: {
      chemist_warehouse: { regularPrice: 4.14, salePrice: 2.69, phaseOffset: 1 },
woolworths: { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 4 },
      coles:      { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 2 },
      amazon:     { regularPrice: 43.20, salePrice: 35.70, phaseOffset: 1, packQty: 12, packLabel: '12 × 25 Pack' },
    }
  },
  {
    id: 'plain-flour-premium-val1', sku: '9302911108986', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102358.jpg', name: 'Plain Flour Premium Val1', size: '2kg', brand: 'White Wings',
    category: 'baking', emoji: '🧁', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 3 },
      coles:      { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 0 },
      amazon:     { regularPrice: 3.84, salePrice: 2.98, phaseOffset: 4, packQty: 1, packLabel: '1 × 2kg' },
    }
  },
  {
    id: 'brown-sugar-soft-cane-val1', sku: '9303087652067', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102501.jpg', name: 'Brown Sugar Soft Cane Val1', size: '1kg', brand: 'CSR',
    category: 'baking', emoji: '🧁', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 1 },
      coles:      { regularPrice: 4.50, salePrice: 4.50, phaseOffset: 3 },
      amazon:     { regularPrice: 3.60, salePrice: 3.82, phaseOffset: 2, packQty: 1, packLabel: '1 × 1kg' },
    }
  },
  {
    id: 'icing-sugar-mixture-val1', sku: '9302909874419', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102357.jpg', name: 'Icing Sugar Mixture Val1', size: '500g', brand: 'CSR',
    category: 'baking', emoji: '🧁', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.20, salePrice: 3.20, phaseOffset: 3 },
      coles:      { regularPrice: 3.20, salePrice: 3.20, phaseOffset: 5 },
      amazon:     { regularPrice: 2.56, salePrice: 2.72, phaseOffset: 4, packQty: 1, packLabel: '1 × 500g' },
    }
  },
  {
    id: 'baking-powder-tin-val1', sku: '9302611109205', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102115.jpg', name: 'Baking Powder Tin Val1', size: '125g', brand: 'McKenzies',
    category: 'baking', emoji: '🧁', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 2.20, phaseOffset: 3 },
      coles:      { regularPrice: 2.80, salePrice: 2.20, phaseOffset: 1 },
      amazon:     { regularPrice: 2.24, salePrice: 1.87, phaseOffset: 0, packQty: 1, packLabel: '1 × 125g' },
    }
  },
  {
    id: 'pure-vanilla-extract-val1', sku: '9303033331119', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102457.jpg', name: 'Pure Vanilla Extract Val1', size: '50ml', brand: 'Queen',
    category: 'baking', emoji: '🧁', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 8.50, salePrice: 6.50, phaseOffset: 1 },
      coles:      { regularPrice: 8.50, salePrice: 6.50, phaseOffset: 3 },
      amazon:     { regularPrice: 6.80, salePrice: 5.52, phaseOffset: 2, packQty: 1, packLabel: '1 × 50ml' },
    }
  },
  {
    id: 'dry-yeast-sachets-5pk-val2', sku: '9303033331119', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102457.jpg', name: 'Dry Yeast Sachets 5pk Val2', size: '5 Pack', brand: 'Lowan',
    category: 'baking', emoji: '🧁', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 0 },
      coles:      { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 2 },
      amazon:     { regularPrice: 3.20, salePrice: 2.55, phaseOffset: 1, packQty: 1, packLabel: '1 × 5 Pack' },
    }
  },
  {
    id: 'basmati-rice-premium-val2', sku: '9303001232377', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102431.jpg', name: 'Basmati Rice Premium Val2', size: '2kg', brand: 'SunRice',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 8.00, salePrice: 5.50, phaseOffset: 0 },
      coles:      { regularPrice: 8.00, salePrice: 5.50, phaseOffset: 2 },
      amazon:     { regularPrice: 76.80, salePrice: 56.10, phaseOffset: 1, packQty: 12, packLabel: '12 × 2kg' },
    }
  },
  {
    id: 'jasmine-rice-fragrant-val2', sku: '9303114812541', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102523.jpg', name: 'Jasmine Rice Fragrant Val2', size: '5kg', brand: 'SunRice',
    category: 'pantry', emoji: '🥫', cycleWeeks: 6,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 18.00, salePrice: 10.00, phaseOffset: 3 },
      coles:      { regularPrice: 18.00, salePrice: 10.00, phaseOffset: 5 },
      amazon:     { regularPrice: 172.80, salePrice: 102.00, phaseOffset: 4, packQty: 12, packLabel: '12 × 5kg' },
    }
  },
  {
    id: 'extra-virgin-olive-oil-val2', sku: '9303238269241', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102623.jpg', name: 'Extra Virgin Olive Oil Val2', size: '750ml', brand: 'Cobram Estate',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 16.00, salePrice: 12.00, phaseOffset: 2 },
      coles:      { regularPrice: 16.00, salePrice: 12.00, phaseOffset: 0 },
      amazon:     { regularPrice: 153.60, salePrice: 122.40, phaseOffset: 3, packQty: 12, packLabel: '12 × 750ml' },
    }
  },
  {
    id: 'pure-canola-cooking-oil-val2', sku: '9303319750663', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102689.jpg', name: 'Pure Canola Cooking Oil Val2', size: '1L', brand: 'WW',
    category: 'pantry', emoji: '🥫', cycleWeeks: 99,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 5.50, phaseOffset: 3 },
      coles:      { regularPrice: 5.50, salePrice: 5.50, phaseOffset: 5 },
      amazon:     { regularPrice: 52.80, salePrice: 56.10, phaseOffset: 4, packQty: 12, packLabel: '12 × 1L' },
    }
  },
  {
    id: 'soy-sauce-gluten-free-val2', sku: '9303088886634', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102502.jpg', name: 'Soy Sauce Gluten Free Val2', size: '250ml', brand: 'Kikkoman',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 3 },
      coles:      { regularPrice: 4.50, salePrice: 3.50, phaseOffset: 0 },
      amazon:     { regularPrice: 43.20, salePrice: 35.70, phaseOffset: 4, packQty: 12, packLabel: '12 × 250ml' },
    }
  },
  {
    id: 'tomato-paste-squeeze-val2', sku: '9303060491593', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102479.jpg', name: 'Tomato Paste Squeeze Val2', size: '500g', brand: 'Leggos',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 3 },
      coles:      { regularPrice: 4.00, salePrice: 3.00, phaseOffset: 1 },
      amazon:     null,
    }
  },
  {
    id: 'canned-sweet-corn-kernels-val2', sku: '9303595059104', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102912.jpg', name: 'Canned Sweet Corn Kernels Val2', size: '420g', brand: 'Edgell',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.00, salePrice: 1.50, phaseOffset: 0 },
      coles:      { regularPrice: 2.00, salePrice: 1.50, phaseOffset: 2 },
      amazon:     { regularPrice: 19.20, salePrice: 15.30, phaseOffset: 1, packQty: 12, packLabel: '12 × 420g' },
    }
  },
  {
    id: 'chunky-tuna-in-olive-oil-val2', sku: '9303429627126', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102778.jpg', name: 'Chunky Tuna in Olive Oil Val2', size: '95g', brand: 'John West',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 1.80, phaseOffset: 0 },
      coles:      { regularPrice: 2.80, salePrice: 1.80, phaseOffset: 2 },
      amazon:     { regularPrice: 26.88, salePrice: 18.36, phaseOffset: 1, packQty: 12, packLabel: '12 × 95g' },
    }
  },
  {
    id: 'tuna-tempters-springwater-val2', sku: '9303750614546', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103038.jpg', name: 'Tuna Tempters Springwater Val2', size: '95g', brand: 'Sirena',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.00, salePrice: 2.00, phaseOffset: 0 },
      coles:      { regularPrice: 3.00, salePrice: 2.00, phaseOffset: 2 },
      amazon:     { regularPrice: 28.80, salePrice: 20.40, phaseOffset: 1, packQty: 12, packLabel: '12 × 95g' },
    }
  },
  {
    id: 'crunchy-peanut-butter-val2', sku: '9303193824829', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102587.jpg', name: 'Crunchy Peanut Butter Val2', size: '375g', brand: 'Bega',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 3 },
      coles:      { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 0 },
      amazon:     { regularPrice: 55.68, salePrice: 40.80, phaseOffset: 4, packQty: 12, packLabel: '12 × 375g' },
    }
  },
  {
    id: 'smooth-peanut-butter-jar-val2', sku: '9303519750517', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102851.jpg', name: 'Smooth Peanut Butter Jar Val2', size: '375g', brand: 'Bega',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 2 },
      coles:      { regularPrice: 5.80, salePrice: 4.00, phaseOffset: 4 },
      amazon:     { regularPrice: 55.68, salePrice: 40.80, phaseOffset: 3, packQty: 12, packLabel: '12 × 375g' },
    }
  },
  {
    id: 'strawberry-jam-spread-val2', sku: '9303170368056', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102568.jpg', name: 'Strawberry Jam Spread Val2', size: '480g', brand: 'IXL',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 0 },
      coles:      { regularPrice: 4.80, salePrice: 3.50, phaseOffset: 2 },
      amazon:     null,
    }
  },
  {
    id: 'pure-honey-squeeze-bottle-val2', sku: '9303659256588', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102964.jpg', name: 'Pure Honey Squeeze Bottle Val2', size: '340g', brand: 'Capilano',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 1 },
      coles:      { regularPrice: 6.50, salePrice: 5.00, phaseOffset: 3 },
      amazon:     { regularPrice: 62.40, salePrice: 51.00, phaseOffset: 2, packQty: 12, packLabel: '12 × 340g' },
    }
  },
  {
    id: 'whole-egg-mayonnaise-jar-val2', sku: '9303451849332', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102796.jpg', name: 'Whole Egg Mayonnaise Jar Val2', size: '380g', brand: 'Praise',
    category: 'pantry', emoji: '🥫', cycleWeeks: 4,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 1 },
      coles:      { regularPrice: 5.50, salePrice: 3.80, phaseOffset: 3 },
      amazon:     { regularPrice: 52.80, salePrice: 38.76, phaseOffset: 2, packQty: 12, packLabel: '12 × 380g' },
    }
  },
  {
    id: 'traditional-tomato-pasta-sauce-val2', sku: '9304269132686', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/103458.jpg', name: 'Traditional Tomato Pasta Sauce Val2', size: '500g', brand: 'Dolmio',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 3.80, salePrice: 2.50, phaseOffset: 1 },
      coles:      { regularPrice: 3.80, salePrice: 2.50, phaseOffset: 3 },
      amazon:     null,
    }
  },
  {
    id: 'spaghetti-pasta-no-5-val2', sku: '9302880244811', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102333.jpg', name: 'Spaghetti Pasta No 5 Val2', size: '500g', brand: 'San Remo',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 4 },
      coles:      { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 1 },
      amazon:     { regularPrice: 26.88, salePrice: 20.40, phaseOffset: 0, packQty: 12, packLabel: '12 × 500g' },
    }
  },
  {
    id: 'penne-rigate-pasta-val2', sku: '9302734565905', imageUrl: 'https://images.woolworthsstatic.com.au/content/wowproductimages/large/102215.jpg', name: 'Penne Rigate Pasta Val2', size: '500g', brand: 'San Remo',
    category: 'pantry', emoji: '🥫', cycleWeeks: 5,
    stores: {
      chemist_warehouse: null,
woolworths: { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 3 },
      coles:      { regularPrice: 2.80, salePrice: 2.00, phaseOffset: 0 },
      amazon:     { regularPrice: 26.88, salePrice: 20.40, phaseOffset: 4, packQty: 12, packLabel: '12 × 500g' },
    }
  }
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
  store:     'all',
  search:    '',
  sort:      'name',
  saleOnly:  false,
  activeChart: null, // Chart.js instance
  favorites: (() => {
    try {
      const saved = localStorage.getItem('pricepulse_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  })()
};

// =====================================================
// SECTION 6: FILTERING & SORTING
// =====================================================

function getVisibleProducts() {
  let list = products;

  if (state.category === 'favorites') {
    list = list.filter(p => state.favorites.includes(p.id));
  } else if (state.category === 'featured') {
    list = list.filter(p => {
      const maxPct = Math.max(...Object.values(p.stores).filter(Boolean).map(s => s.discountPct || 0), 0);
      return p.anyOnSale || maxPct >= 20 || state.favorites.includes(p.id);
    });
  } else if (state.category === 'rare-sales') {
    list = list.filter(p => p.cycleWeeks >= 6);
  } else if (state.category !== 'all') {
    list = list.filter(p => p.category === state.category);
  }

  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.size.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      p.id.toLowerCase().includes(q)
    );
  }

  if (state.store !== 'all') {
    list = list.filter(p => p.stores[state.store] !== null);
  }

  if (state.saleOnly) {
    if (state.store !== 'all') {
      list = list.filter(p => p.stores[state.store]?.onSale);
    } else {
      list = list.filter(p => p.anyOnSale);
    }
  }

  list = [...list].sort((a, b) => {
    const getPrice = (p) => {
      if (state.store !== 'all' && p.stores[state.store]) {
        const s = p.stores[state.store];
        return s.currentUnitPrice ?? s.currentPrice;
      }
      return p.lowestPrice;
    };

    const getMaxDiscountPct = (p) => {
      if (state.store !== 'all' && p.stores[state.store]) {
        return p.stores[state.store].discountPct || 0;
      }
      return Math.max(...Object.values(p.stores).filter(Boolean).map(s => s.discountPct || 0), 0);
    };

    const getMaxDiscountDollar = (p) => {
      const getSavings = (s) => {
        if (!s || !s.onSale) return 0;
        return Math.max(0, (s.regularPrice || 0) - (s.salePrice || 0));
      };
      if (state.store !== 'all' && p.stores[state.store]) {
        return getSavings(p.stores[state.store]);
      }
      return Math.max(...Object.values(p.stores).filter(Boolean).map(getSavings), 0);
    };

    switch (state.sort) {
      case 'price-asc':  return getPrice(a) - getPrice(b);
      case 'price-desc': return getPrice(b) - getPrice(a);
      case 'discount':
      case 'discount-pct': return getMaxDiscountPct(b) - getMaxDiscountPct(a);
      case 'discount-dollar': return getMaxDiscountDollar(b) - getMaxDiscountDollar(a);
      case 'featured': {
        const getScore = (p) => {
          let score = 0;
          if (state.favorites.includes(p.id)) score += 200;
          if (p.anyOnSale) score += 100;
          score += getMaxDiscountPct(p);
          return score;
        };
        return getScore(b) - getScore(a);
      }
      case 'cycle-longest': {
        return (b.cycleWeeks || 0) - (a.cycleWeeks || 0);
      }
      case 'next-sale':  {
        const getNextSaleDays = (p) => {
          if (state.store !== 'all' && p.stores[state.store]?.nextSale) {
            return p.stores[state.store].nextSale.daysUntil;
          }
          return p.earliestNextSale?.daysUntil ?? 9999;
        };
        return getNextSaleDays(a) - getNextSaleDays(b);
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
  const rareCount   = products.filter(p => p.cycleWeeks >= 6).length;
  document.getElementById('statItems').textContent = products.length;
  document.getElementById('statSale').textContent  = onSaleCount;
  const rareEl = document.getElementById('statRare');
  if (rareEl) rareEl.textContent = rareCount;
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
    if (state.category === 'favorites') {
      empty.innerHTML = `
        <span class="empty-emoji">⭐</span>
        <p>Your watchlist is empty.</p>
        <p style="font-size:13px;color:var(--text-muted);margin-top:6px">Click the star icon on any product card to add it to your watchlist!</p>
      `;
    } else {
      empty.innerHTML = `
        <span class="empty-emoji">🔎</span>
        <p>No products match your search. Try a different term or category.</p>
      `;
    }
    return;
  }

  empty.hidden = true;
  const cat = state.category !== 'all' ? (state.category === 'favorites' ? 'Watchlist' : (state.category === 'featured' ? 'Featured Deals' : (state.category === 'rare-sales' ? 'Rare Sales & Staples' : CATEGORIES[state.category]?.label))) : null;
  const storeLabel = state.store !== 'all' ? (state.store === 'amazon' ? 'Amazon AU' : state.store.charAt(0).toUpperCase() + state.store.slice(1)) : null;
  info.textContent = `Showing ${visible.length} item${visible.length !== 1 ? 's' : ''}${cat ? ' in ' + cat : ''}${storeLabel ? ' available at ' + storeLabel : ''}`;

  grid.innerHTML = visible.map((p, i) => cardHTML(p, i)).join('');

  // Attach click events to all cards (ignoring favorite button clicks)
  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.favorite-btn')) return;
      openModal(card.dataset.id);
    });
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

    const storePrice = s.currentUnitPrice ?? s.currentPrice;
    const isBest  = storePrice === p.lowestPrice;
    const isAmazon = key === 'amazon';
    const bestTag  = isBest ? '<span class="best-tag">Best</span>' : '';

    let priceHTML;
    if (isAmazon && s.packQty && s.packLabel) {
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

  const isFav = state.favorites.includes(p.id);
  const favClass = isFav ? 'active' : '';
  const favStar = isFav ? '★' : '☆';

  let badgeHTML = '';
  if (p.anyOnSale) {
    badgeHTML = '<span class="sale-badge">On Sale</span>';
  } else if (p.cycleWeeks >= 8) {
    badgeHTML = `<span class="rare-sale-badge">${p.cycleWeeks}wk Cycle</span>`;
  } else if (p.cycleWeeks >= 6) {
    badgeHTML = '<span class="rare-sale-badge">Rare Sale</span>';
  }

  const cardMedia = p.imageUrl ? `<div class="card-media-wrap"><img src="${p.imageUrl}" alt="${p.name}" class="card-img" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\"card-emoji\">${p.emoji}</span>';"></div>` : `<div class="card-emoji" aria-hidden="true">${p.emoji}</div>`;

  return `
    <article class="product-card ${p.anyOnSale ? 'on-sale' : ''}"
             role="listitem"
             data-id="${p.id}"
             data-delay="${idx * 35}"
             tabindex="0"
             aria-label="${p.name} ${p.size} – click to view price history">
      <button class="favorite-btn ${favClass}" onclick="toggleFavorite('${p.id}', event)" title="${isFav ? 'Remove from Watchlist' : 'Add to Watchlist'}" aria-label="${isFav ? 'Remove from Watchlist' : 'Add to Watchlist'}">${favStar}</button>
      <div class="card-head">
        <div>
          ${cardMedia}
        </div>
        ${badgeHTML}
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

function findSimilarProducts(targetProduct, limit = 4) {
  const stopWords = new Set(['and', 'the', 'or', 'in', 'of', 'for', 'with', 'a', 'an', 'pack', 'pk', 'g', 'ml', 'l', 'kg', 'x', '100g', '200g', '500g', '1kg']);
  const getKeywords = (str) => {
    return str.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 1 && !stopWords.has(w));
  };

  const targetKeywords = getKeywords(targetProduct.name);

  const scored = products
    .filter(p => p.id !== targetProduct.id)
    .map(p => {
      let score = 0;
      if (p.category === targetProduct.category) score += 50;
      if (p.brand && targetProduct.brand && p.brand.toLowerCase() === targetProduct.brand.toLowerCase()) {
        score += 30;
      }
      const otherKeywords = getKeywords(p.name);
      for (const kw of targetKeywords) {
        if (otherKeywords.includes(kw)) score += 15;
      }
      return { product: p, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(item => item.product);
}

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

    const storePrice = s.currentUnitPrice ?? s.currentPrice;
    const isBest  = storePrice === p.lowestPrice;
    const isAmazon = key === 'amazon';
    const bestTag  = isBest ? '<span class="best-tag">✓ Best Value</span>' : '';

    let mainPrice, detailLine;
    if (isAmazon && s.packQty && s.packLabel) {
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

  // Predictions per store
  const predRowsHTML = Object.entries(STORES).map(([key, store]) => {
    const s = p.stores[key];
    if (!s) return '';

    const ns = s.nextSale;
    let predInfo;
    if (ns && ns.currentlyOnSale) {
      predInfo = `<div class="pred-days onsale">🟢 On sale now!</div><div class="pred-days" style="margin-top:2px">Next cycle ~${ns.daysUntil}d</div>`;
    } else if (ns) {
      const cls = ns.daysUntil <= 7 ? 'soon' : '';
      predInfo  = `<div class="pred-date">${ns.label}</div><div class="pred-days ${cls}">${ns.daysUntil === 0 ? 'Today' : `~${ns.daysUntil} days away`}</div>`;
    } else {
      predInfo  = `<div class="pred-days" style="color:var(--text-muted)">No sales cycle tracked</div>`;
    }

    return `
      <div class="prediction-row">
        <div class="pred-store">
          <span class="store-dot ${store.dotClass}"></span>${store.name}
        </div>
        <div class="pred-info">${predInfo}</div>
      </div>`;
  }).filter(Boolean).join('');

  // Similar / Comparative Products
  const similarProducts = findSimilarProducts(p, 4);
  let similarHTML = '';
  if (similarProducts.length > 0) {
    const similarCards = similarProducts.map(sim => {
      const storeDots = Object.entries(STORES)
        .filter(([key]) => sim.stores[key] !== null)
        .map(([key, store]) => `<span class="store-dot ${store.dotClass}" title="${store.name}"></span>`)
        .join('');

      return `
        <div class="similar-card" onclick="openModal('${sim.id}')" role="button" tabindex="0" aria-label="View ${sim.name}">
          <div>
            <div class="similar-card-head">
              <span class="similar-card-emoji" aria-hidden="true">${sim.emoji}</span>
              <div class="similar-card-title">${sim.name}</div>
            </div>
            <div class="similar-card-meta">${sim.size} · ${sim.brand}</div>
          </div>
          <div class="similar-card-foot">
            <div class="similar-card-price ${sim.anyOnSale ? 'sale-price' : ''}">$${sim.lowestPrice.toFixed(2)}${sim.anyOnSale ? ' 🔥' : ''}</div>
            <div class="similar-card-stores">${storeDots}</div>
          </div>
        </div>`;
    }).join('');

    similarHTML = `
      <div class="modal-section">
        <p class="modal-section-title">🔄 Similar Products to Compare</p>
        <div class="similar-grid">${similarCards}</div>
      </div>`;
  }

  const skuHTML = p.sku ? `<span class="sku-badge" title="Product Barcode / SKU">🏷️ Barcode/SKU: ${p.sku}</span>` : `<span class="sku-badge">🏷️ ID: ${p.id}</span>`;
  const mediaHTML = p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" class="modal-product-img" onerror="this.onerror=null; this.outerHTML='<span class=\"modal-product-emoji\">${p.emoji}</span>';">` : `<span class="modal-product-emoji" aria-hidden="true">${p.emoji}</span>`;

  return `
    <div class="modal-header">
      ${mediaHTML}
      <h2 id="modalProductName">${p.name}</h2>
      <p class="modal-product-sub">${p.size} · ${p.brand} · ${CATEGORIES[p.category]?.label || p.category}</p>
      ${skuHTML}
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
    </div>

    <!-- Similar Products -->
    ${similarHTML}`;
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
  const firstStore = Object.values(p.stores).find(Boolean);
  const labels   = firstStore?.history.map(h => h.label) ?? [];
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

  // Store filter
  document.getElementById('storeSelect').addEventListener('change', e => {
    state.store = e.target.value;
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

  // Cache sync button
  const syncBtn = document.getElementById('syncCacheBtn');
  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      syncBtn.classList.add('spinning');
      syncBtn.disabled = true;
      updateSourceBadge('Syncing...', 'info');
      try {
        // Clear IndexedDB cache
        await DBCache.clear();
        
        // Re-run init to fetch fresh data
        const creds = getSavedCredentials();
        if (creds && creds.url && creds.key) {
          const client = initSupabase(creds.url, creds.key);
          const dbData = await fetchDbData(client);
          
          if (dbData.products && dbData.products.length > 0) {
            products = processSupabaseData(dbData.products, dbData.snapshots);
            updateSourceBadge('Supabase', 'connected');
            
            // Write fresh data to cache
            await DBCache.set('products', dbData.products);
            await DBCache.set('snapshots', dbData.snapshots);
            await DBCache.set('cache_timestamp', Date.now());
            
            if (dbData.snapshots.length > 0) {
              const dates = dbData.snapshots.map(s => s.week_start);
              const maxDate = new Date(dates.reduce((a, b) => a > b ? a : b));
              document.getElementById('statDate').textContent = formatDateLabel(maxDate) + ' ' + maxDate.getFullYear();
            }
          }
        }
      } catch (e) {
        console.error('Manual cache sync failed', e);
      } finally {
        syncBtn.classList.remove('spinning');
        syncBtn.disabled = false;
        renderStats();
        renderGrid();
      }
    });
  }
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

  let snapshots = [];
  let start = 0;
  const batchSize = 10000;
  let keepFetching = true;

  while (keepFetching) {
    const snapshotsResponse = await client
      .from('price_snapshots')
      .select('*')
      .order('week_start', { ascending: false })
      .range(start, start + batchSize - 1);

    if (snapshotsResponse.error) {
      throw new Error(`Failed to fetch price snapshots: ${snapshotsResponse.error.message}`);
    }

    const data = snapshotsResponse.data || [];
    snapshots = snapshots.concat(data);

    if (data.length < batchSize) {
      keepFetching = false;
    } else {
      start += batchSize;
    }
  }

  return {
    products: productsResponse.data,
    snapshots: snapshots,
  };
}

function processSupabaseData(dbProducts, dbSnapshots) {
  const rawMap = new Map((typeof RAW_PRODUCTS !== 'undefined' ? RAW_PRODUCTS : []).map(r => [r.id, r]));

  return dbProducts.map((p, idx) => {
    const rawMatch = rawMap.get(p.id);
    const rawProcessed = rawMatch ? processProducts([rawMatch])[0] : null;

    const stores = {};
    for (const key of Object.keys(STORES)) { stores[key] = null; }
    const pSnapshots = (dbSnapshots || []).filter(s => s.product_id === p.id);

    for (const storeId of Object.keys(STORES)) {
      const sSnaps = pSnapshots
        .filter(s => s.store_id === storeId)
        .sort((a, b) => a.week_start.localeCompare(b.week_start));

      if (sSnaps.length === 0) {
        if (rawProcessed && rawProcessed.stores && rawProcessed.stores[storeId]) {
          stores[storeId] = rawProcessed.stores[storeId];
        }
        continue;
      }

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

    const minPrice  = comparePrices.length > 0 ? Math.min(...comparePrices.map(c => c.price)) : (rawProcessed?.lowestPrice || 0);
    const bestStore = comparePrices.find(c => c.price === minPrice)?.key ?? (rawProcessed?.bestStore || null);

    const anyOnSale = Object.values(stores).some(s => s?.onSale);

    const nextSaleList = Object.values(stores)
      .filter(s => s?.nextSale)
      .sort((a, b) => a.nextSale.daysUntil - b.nextSale.daysUntil);
    const earliestNextSale = nextSaleList[0]?.nextSale ?? (rawProcessed?.earliestNextSale || null);

    return {
      id:          p.id,
      name:        p.name,
      size:        p.size,
      brand:       p.brand,
      category:    p.category,
      emoji:       p.emoji || rawProcessed?.emoji || '🛒',
      cycleWeeks:  p.cycle_weeks || rawProcessed?.cycleWeeks || 4,
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
  disconnectBtn.addEventListener('click', async () => {
    clearCredentials();
    urlInput.value = '';
    keyInput.value = '';
    
    try {
      await DBCache.clear();
    } catch (cacheErr) {}
    
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

    if (!url || !key) {
      statusBox.textContent = 'Please enter both Supabase URL and Service Role / Anon Key.';
      statusBox.className = 'status-msg-box error';
      statusBox.style.display = 'block';
      return;
    }

    try {
      statusBox.textContent = 'Testing connection...';
      statusBox.className = 'status-msg-box info';
      statusBox.style.display = 'block';

      const testClient = initSupabase(url, key);
      const dbData = await fetchDbData(testClient);

      if (!dbData.products || dbData.products.length === 0) {
        throw new Error('Database connected, but no products were found.');
      }

      saveCredentials(url, key);
      supabaseClient = testClient;

      // Update cache
      await DBCache.set('products', dbData.products);
      await DBCache.set('snapshots', dbData.snapshots);
      await DBCache.set('cache_timestamp', Date.now());

      products = processSupabaseData(dbData.products, dbData.snapshots);
      updateSourceBadge('Supabase', 'connected');

      statusBox.textContent = `Success! Connected to database (${dbData.products.length} products).`;
      statusBox.className = 'status-msg-box success';

      renderStats();
      renderGrid();

      setTimeout(closeSettings, 1200);
    } catch (err) {
      statusBox.textContent = `Connection failed: ${err.message}`;
      statusBox.className = 'status-msg-box error';
    }
  });
}

// =====================================================
// INDEXEDDB CACHE HELPER & WATCHLIST HELPERS
// =====================================================
const DBCache = {
  dbName: 'PricePulseCache',
  storeName: 'snapshots',
  
  open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(this.storeName);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },
  
  async get(key) {
    try {
      const db = await this.open();
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const req = tx.objectStore(this.storeName).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  },
  
  async set(key, value) {
    try {
      const db = await this.open();
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        tx.objectStore(this.storeName).put(value, key);
        tx.oncomplete = () => resolve(true);
      });
    } catch (e) {
      return false;
    }
  },
  
  async clear() {
    try {
      const db = await this.open();
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        tx.objectStore(this.storeName).clear();
        tx.oncomplete = () => resolve(true);
      });
    } catch (e) {
      return false;
    }
  }
};

function toggleFavorite(productId, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const idx = state.favorites.indexOf(productId);
  if (idx > -1) {
    state.favorites.splice(idx, 1);
  } else {
    state.favorites.push(productId);
  }
  try {
    localStorage.setItem('pricepulse_favorites', JSON.stringify(state.favorites));
  } catch (e) {}
  
  renderGrid();
  renderStats();
}
window.toggleFavorite = toggleFavorite;

async function init() {
  initListeners();
  setupSettingsUI();

  const creds = getSavedCredentials();

  if (creds && creds.url && creds.key) {
    try {
      updateSourceBadge('Connecting...', 'info');
      supabaseClient = initSupabase(creds.url, creds.key);
      
      // Check cache first
      const cachedTime = await DBCache.get('cache_timestamp');
      const twelveHours = 12 * 60 * 60 * 1000;
      let dbData = null;
      
      if (cachedTime && (Date.now() - cachedTime) < twelveHours) {
        const cachedProducts = await DBCache.get('products');
        const cachedSnapshots = await DBCache.get('snapshots');
        if (cachedProducts && cachedSnapshots && cachedSnapshots.length > 50) {
          dbData = { products: cachedProducts, snapshots: cachedSnapshots };
          console.log('Loaded database catalog and snapshots from client IndexedDB cache.');
        }
      }
      
      if (!dbData) {
        dbData = await fetchDbData(supabaseClient);
        // Save to cache
        await DBCache.set('products', dbData.products);
        await DBCache.set('snapshots', dbData.snapshots);
        await DBCache.set('cache_timestamp', Date.now());
        console.log('Saved database catalog and snapshots to client IndexedDB cache.');
      }

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
