"""
PricePulse scraper configuration.
Values are loaded from environment variables (set in .env locally,
or GitHub Actions Secrets in production).

Copy this file to .env.local and fill in your credentials:
  SUPABASE_URL=https://xxxx.supabase.co
  SUPABASE_SERVICE_KEY=your-service-role-key
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ── Supabase ────────────────────────────────────────
SUPABASE_URL         = os.getenv('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise EnvironmentError(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY. "
        "Create a .env file based on .env.example."
    )

# ── Scraper behaviour ───────────────────────────────
REQUEST_TIMEOUT   = 15       # seconds per HTTP request
REQUEST_DELAY     = 4.5      # seconds between requests (be polite)
MAX_RETRIES       = 3        # retry failed requests this many times
MOCK_MODE         = os.getenv('MOCK_MODE', 'false').lower() == 'true'
                             # Set MOCK_MODE=true to skip real HTTP calls during dev

# ── Products to track ───────────────────────────────
# Each entry: product_id (matches Supabase), search term per store
TRACKED_ITEMS = [
    {
        'id': 'coca-cola-125l',
        'woolworths_term': 'coca cola 1.25l',
        'coles_term':      'coca cola 1.25l',
        'amazon_asin':     'B07XXXXXXXXX',   # Replace with real ASIN from amazon.com.au
    },
    {
        'id': 'pepsi-max-125l',
        'woolworths_term': 'pepsi max 1.25l',
        'coles_term':      'pepsi max 1.25l',
        'amazon_asin':     'B07XXXXXXXXY',
    },
    {
        'id': 'sprite-125l',
        'woolworths_term': 'sprite 1.25l',
        'coles_term':      'sprite 1.25l',
        'amazon_asin':     'B07XXXXXXXXZ',
    },
    {
        'id': 'solo-125l',
        'woolworths_term': 'solo lemon 1.25l',
        'coles_term':      'solo lemon 1.25l',
        'amazon_asin':     None,
    },
    {
        'id': 'mt-franklin-600ml',
        'woolworths_term': 'mount franklin sparkling 600ml',
        'coles_term':      'mount franklin sparkling 600ml',
        'amazon_asin':     'B08XXXXXXXXA',
    },
    {
        'id': 'skittles-original-160g',
        'woolworths_term': 'skittles original 160g',
        'coles_term':      'skittles original 160g',
        'amazon_asin':     'B08XXXXXXXXB',
    },
    {
        'id': 'allens-snakes-220g',
        'woolworths_term': 'allens snakes alive 220g',
        'coles_term':      'allens snakes 220g',
        'amazon_asin':     None,
    },
    {
        'id': 'mentos-fruit-roll',
        'woolworths_term': 'mentos fruit roll',
        'coles_term':      'mentos fruit roll',
        'amazon_asin':     'B08XXXXXXXXC',
    },
    {
        'id': 'cadbury-dairy-milk-180g',
        'woolworths_term': 'cadbury dairy milk 180g',
        'coles_term':      'cadbury dairy milk 180g',
        'amazon_asin':     'B08XXXXXXXXD',
    },
    {
        'id': 'cadbury-favourites-500g',
        'woolworths_term': 'cadbury favourites 500g',
        'coles_term':      'cadbury favourites 500g',
        'amazon_asin':     None,
    },
    {
        'id': 'kitkat-chunky-4pk',
        'woolworths_term': 'kit kat chunky 4 pack',
        'coles_term':      'kit kat chunky 4 pack',
        'amazon_asin':     'B08XXXXXXXXE',
    },
    {
        'id': 'lindt-excellence-85g',
        'woolworths_term': 'lindt excellence 70 85g',
        'coles_term':      'lindt excellence dark 85g',
        'amazon_asin':     'B08XXXXXXXXF',
    },
    {
        'id': 'snickers-4pk',
        'woolworths_term': 'snickers 4 pack',
        'coles_term':      'snickers 4 pack',
        'amazon_asin':     None,
    },
    {
        'id': 'pringles-original-134g',
        'woolworths_term': 'pringles original 134g',
        'coles_term':      'pringles original 134g',
        'amazon_asin':     'B08XXXXXXXXG',
    },
    {
        'id': 'smiths-crinkle-150g',
        'woolworths_term': 'smiths crinkle cut 150g',
        'coles_term':      'smiths crinkle 150g',
        'amazon_asin':     None,
    },
    {
        'id': 'kettle-sea-salt-150g',
        'woolworths_term': 'kettle sea salt 150g',
        'coles_term':      'kettle sea salt 150g',
        'amazon_asin':     'B08XXXXXXXXH',
    },
    {
        'id': 'magnum-classic-4pk',
        'woolworths_term': 'magnum classic 4 pack',
        'coles_term':      'magnum classic 4 pack',
        'amazon_asin':     None,
    },
    {
        'id': 'ben-jerrys-458ml',
        'woolworths_term': 'ben jerrys 458ml',
        'coles_term':      'ben jerrys 458ml',
        'amazon_asin':     None,
    },
    {
        'id': 'streets-blue-ribbon-2l',
        'woolworths_term': 'streets blue ribbon 2l',
        'coles_term':      'streets blue ribbon 2l',
        'amazon_asin':     None,
    },
    # ── Essentials ──
    {
        'id': 'woolworths-milk-2l',
        'woolworths_term': 'woolworths full cream milk 2l',
        'coles_term':      'coles full cream milk 2l',
        'amazon_asin':     None,
    },
    {
        'id': 'tip-top-bread-700g',
        'woolworths_term': 'tip top the one bread 700g',
        'coles_term':      'tip top the one bread 700g',
        'amazon_asin':     None,
    },
    {
        'id': 'western-star-butter-500g',
        'woolworths_term': 'western star butter 500g',
        'coles_term':      'western star butter 500g',
        'amazon_asin':     None,
    },
    {
        'id': 'nescafe-blend-43-150g',
        'woolworths_term': 'nescafe blend 43 150g',
        'coles_term':      'nescafe blend 43 150g',
        'amazon_asin':     None,
    },
    {
        'id': 'weetbix-1.2kg',
        'woolworths_term': 'sanitarium weet bix 1.2kg',
        'coles_term':      'sanitarium weet bix 1.2kg',
        'amazon_asin':     None,
    },
    {
        'id': 'quilton-toilet-paper-18pk',
        'woolworths_term': 'quilton toilet tissue 3 ply 18 pack',
        'coles_term':      'quilton toilet tissue 3 ply 18 pack',
        'amazon_asin':     None,
    },
    # ── Snacks & Beverages ──
    {
        'id': 'red-bull-4pk',
        'woolworths_term': 'red bull energy drink 4 x 250ml',
        'coles_term':      'red bull energy drink 4 pack',
        'amazon_asin':     None,
    },
    {
        'id': 'doritos-cheese-170g',
        'woolworths_term': 'doritos cheese supreme 170g',
        'coles_term':      'doritos cheese supreme 170g',
        'amazon_asin':     None,
    },
    {
        'id': 'thins-original-175g',
        'woolworths_term': 'thins potato chips light tangy 175g',
        'coles_term':      'thins potato chips light tangy 175g',
        'amazon_asin':     None,
    },
    {
        'id': 'arnotts-tim-tam-200g',
        'woolworths_term': 'arnotts tim tam chocolate biscuits 200g',
        'coles_term':      'arnotts tim tam chocolate biscuits 200g',
        'amazon_asin':     None,
    },
    {
        'id': 'twisties-cheese-90g',
        'woolworths_term': 'twisties cheese 90g',
        'coles_term':      'twisties cheese 90g',
        'amazon_asin':     None,
    },
    # ── Pantry Staples ──
    {
        'id': 'san-remo-pasta-500g',
        'woolworths_term': 'san remo spaghetti 500g',
        'coles_term':      'san remo spaghetti 500g',
        'amazon_asin':     None,
    },
    {
        'id': 'sunrice-jasmine-rice-5kg',
        'woolworths_term': 'sunrice jasmine rice 5kg',
        'coles_term':      'sunrice jasmine rice 5kg',
        'amazon_asin':     None,
    },
    {
        'id': 'cobram-estate-olive-oil-750ml',
        'woolworths_term': 'cobram estate extra virgin olive oil classic 750ml',
        'coles_term':      'cobram estate extra virgin olive oil classic 750ml',
        'amazon_asin':     None,
    },
    {
        'id': 'john-west-tuna-95g',
        'woolworths_term': 'john west tuna tempters olive oil 95g',
        'coles_term':      'john west tuna tempters olive oil 95g',
        'amazon_asin':     None,
    },
    {
        'id': 'leggos-tomato-paste-500g',
        'woolworths_term': 'leggos tomato paste 500g',
        'coles_term':      'leggos tomato paste 500g',
        'amazon_asin':     None,
    },
]
