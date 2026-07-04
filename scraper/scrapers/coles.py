"""
Coles price scraper.

Uses Coles' public-facing search API endpoint. For personal use at low rates only.
"""

import time
import json
import logging
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

SEARCH_URL = 'https://www.coles.com.au/api/2.0.0/page/searchresults'

HEADERS = {
    'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                       '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept':          'application/json, text/plain, */*',
    'Accept-Language': 'en-AU,en;q=0.9',
    'Referer':         'https://www.coles.com.au/search?q=coca+cola',
    'Origin':          'https://www.coles.com.au',
}


def search_product(search_term: str, timeout: int = 15, retries: int = 3) -> dict | None:
    """
    Search Coles for a product and return the best-matching result.

    Returns a dict with keys:
        price, regular_price, on_sale, discount_pct, name
    or None if not found / request failed.
    """
    params = {
        'q':                    search_term,
        'page':                 '1',
        'pageSize':             '5',
        'inStoreProductsOnly': 'false',
    }

    for attempt in range(1, retries + 1):
        try:
            resp = requests.get(
                SEARCH_URL,
                params=params,
                headers=HEADERS,
                timeout=timeout,
            )
            resp.raise_for_status()
            data = resp.json()
            return _parse_response(data, search_term)

        except requests.HTTPError as e:
            logger.warning(f'[Coles] HTTP {e.response.status_code} on attempt {attempt}')
            if e.response.status_code == 403:
                # Coles may block scraping — try the HTML fallback
                logger.info('[Coles] Trying HTML fallback...')
                result = _html_fallback(search_term, timeout)
                if result:
                    return result
            if attempt < retries:
                time.sleep(2 ** attempt)

        except (requests.RequestException, json.JSONDecodeError, KeyError) as e:
            logger.warning(f'[Coles] Error on attempt {attempt}: {e}')
            if attempt < retries:
                time.sleep(2 ** attempt)

    logger.error(f'[Coles] Failed to fetch "{search_term}" after {retries} attempts')
    return None


def _parse_response(data: dict, search_term: str) -> dict | None:
    """Parse the Coles JSON search response."""
    # Coles API response structure varies — handle multiple patterns
    results = (
        data.get('results')
        or data.get('searchResults', {}).get('results')
        or data.get('catalogGroupView', [])
    )

    if not results:
        logger.warning(f'[Coles] No results for "{search_term}"')
        return None

    product = results[0]

    # Extract fields (Coles field names vary by API version)
    price         = _extract_price(product)
    was_price     = _extract_was_price(product)
    is_on_special = _detect_special(product, price, was_price)
    name          = product.get('name') or product.get('fullName', '')

    if price is None:
        return None

    discount_pct = None
    if was_price and was_price > price:
        discount_pct = round((1 - price / was_price) * 100)

    logger.info(
        f'[Coles] "{name}" → ${price:.2f}'
        + (f' (was ${was_price:.2f}, -{discount_pct}%)' if is_on_special else ' (regular)')
    )

    return {
        'price':         float(price),
        'regular_price': float(was_price) if was_price else float(price),
        'on_sale':       bool(is_on_special),
        'discount_pct':  discount_pct,
        'name':          name,
    }


def _extract_price(product: dict) -> float | None:
    """Try common field names for current price."""
    for key in ['nowPrice', 'price', 'salePrice', 'priceValue']:
        val = product.get(key)
        if val is not None:
            try:
                return float(str(val).replace('$', '').strip())
            except (ValueError, TypeError):
                continue
    return None


def _extract_was_price(product: dict) -> float | None:
    """Try common field names for regular/was price."""
    for key in ['wasPrice', 'regularPrice', 'listPrice', 'originalPrice']:
        val = product.get(key)
        if val is not None:
            try:
                return float(str(val).replace('$', '').strip())
            except (ValueError, TypeError):
                continue
    return None


def _detect_special(product: dict, price: float | None, was_price: float | None) -> bool:
    """Determine if the product is currently on sale."""
    if product.get('isOnSpecial') or product.get('onSpecial'):
        return True
    if price and was_price and was_price > price * 1.05:
        return True
    return False


def _html_fallback(search_term: str, timeout: int) -> dict | None:
    """
    Fallback: scrape the Coles website HTML search results page.
    Less reliable but works when the JSON API is blocked.
    """
    try:
        url = f'https://www.coles.com.au/search?q={search_term.replace(" ", "+")}'
        resp = requests.get(url, headers=HEADERS, timeout=timeout)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'lxml')

        # Product prices are in data attributes on the page
        price_els = soup.select('[data-testid="product-pricing"]')
        if not price_els:
            price_els = soup.select('.price')

        if not price_els:
            return None

        price_text = price_els[0].get_text(strip=True)
        price = float(price_text.replace('$', '').split()[0])
        logger.info(f'[Coles HTML] Found price ${price:.2f} for "{search_term}"')
        return {'price': price, 'regular_price': price, 'on_sale': False, 'discount_pct': None, 'name': search_term}

    except Exception as e:
        logger.warning(f'[Coles HTML fallback] Failed: {e}')
        return None
