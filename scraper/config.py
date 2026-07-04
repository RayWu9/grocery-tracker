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
REQUEST_DELAY     = 2.0      # seconds between requests (be polite)
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
]
