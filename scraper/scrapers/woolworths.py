"""
Woolworths price scraper.

Uses Woolworths' internal search API (the same endpoint their website uses).
This is for personal use only at low request rates.
"""

import time
import json
import logging
import requests

logger = logging.getLogger(__name__)

SEARCH_URL = 'https://www.woolworths.com.au/apis/ui/Search/products'

# Headers that mimic a real browser session
HEADERS = {
    'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                       '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept':          'application/json, text/plain, */*',
    'Accept-Language': 'en-AU,en;q=0.9',
    'Referer':         'https://www.woolworths.com.au/shop/search/products',
    'Origin':          'https://www.woolworths.com.au',
    'X-Requested-With': 'XMLHttpRequest',
}

SEARCH_PAYLOAD = {
    'Filters':        [],
    'IsSpecial':      False,
    'Location':       '/shop/search/products?searchTerm={term}',
    'PageNumber':     1,
    'PageSize':       5,
    'SearchTerm':     '{term}',
    'SortType':       'TraderRelevance',
    'token':          '',
    'spelling':       {'suggestedTerm': ''},
}


def search_product(search_term: str, timeout: int = 15, retries: int = 3) -> dict | None:
    """
    Search Woolworths for a product and return the best-matching result.

    Returns a dict with keys:
        price, regular_price, on_sale, discount_pct, name, description
    or None if not found / request failed.
    """
    payload = {**SEARCH_PAYLOAD}
    payload['SearchTerm'] = search_term
    payload['Location']   = f'/shop/search/products?searchTerm={search_term.replace(" ", "+")}'

    session = requests.Session()
    # Warm up the session with a GET to set cookies
    try:
        session.get('https://www.woolworths.com.au', headers=HEADERS, timeout=timeout)
        time.sleep(1)
    except requests.RequestException:
        pass  # Continue anyway

    for attempt in range(1, retries + 1):
        try:
            resp = session.post(
                SEARCH_URL,
                json=payload,
                headers=HEADERS,
                timeout=timeout,
            )
            resp.raise_for_status()
            data = resp.json()
            return _parse_response(data, search_term)

        except requests.HTTPError as e:
            logger.warning(f'[Woolworths] HTTP error on attempt {attempt}: {e}')
            if attempt < retries:
                time.sleep(2 ** attempt)
        except (requests.RequestException, json.JSONDecodeError) as e:
            logger.warning(f'[Woolworths] Request error on attempt {attempt}: {e}')
            if attempt < retries:
                time.sleep(2 ** attempt)

    logger.error(f'[Woolworths] Failed to fetch "{search_term}" after {retries} attempts')
    return None


def _parse_response(data: dict, search_term: str) -> dict | None:
    """Extract price information from the Woolworths API JSON response."""
    products = data.get('Products', [])
    if not products:
        logger.warning(f'[Woolworths] No results for "{search_term}"')
        return None

    # Take the first result (most relevant)
    item = products[0]

    # Products can have different structures — handle both
    if 'Products' in item:
        product = item['Products'][0]
    else:
        product = item

    price         = product.get('Price')
    was_price     = product.get('WasPrice')
    is_on_special = product.get('IsOnSpecial', False)
    name          = product.get('Name', '')
    description   = product.get('Description', '')

    image_url     = product.get('MediumImageURI') or product.get('LargeImageURI')
    sku           = str(product.get('Stockcode') or product.get('Barcode') or '')

    if price is None:
        logger.warning(f'[Woolworths] No price for "{search_term}" (found: {name})')
        return None

    discount_pct = None
    if was_price and was_price > price:
        discount_pct = round((1 - price / was_price) * 100)

    logger.info(
        f'[Woolworths] "{name}" → ${price:.2f}'
        + (f' (was ${was_price:.2f}, -{discount_pct}%)' if is_on_special else ' (regular)')
    )

    return {
        'price':         float(price),
        'regular_price': float(was_price) if was_price else float(price),
        'on_sale':       bool(is_on_special),
        'discount_pct':  discount_pct,
        'name':          name,
        'description':   description,
        'image_url':     image_url,
        'sku':           sku,
    }
