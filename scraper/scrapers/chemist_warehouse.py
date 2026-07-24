"""
Chemist Warehouse Australia price scraper module.

Searches Chemist Warehouse for products and parses pricing and sale information.
For personal use only at low request rates.
"""

import time
import json
import logging
import requests
import re

logger = logging.getLogger(__name__)

SEARCH_URL = 'https://www.chemistwarehouse.com.au/search'

HEADERS = {
    'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                       '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-AU,en;q=0.9',
    'Referer':         'https://www.chemistwarehouse.com.au/',
}


def search_product(search_term: str, timeout: int = 15, retries: int = 3) -> dict | None:
    """
    Search Chemist Warehouse for a product and return price details.

    Returns a dict with keys:
        price, regular_price, on_sale, discount_pct, name, description
    or None if not found / request failed.
    """
    params = {
        'searchtext': search_term,
        'searchmode': 'allwords'
    }

    session = requests.Session()

    for attempt in range(1, retries + 1):
        try:
            resp = session.get(
                SEARCH_URL,
                params=params,
                headers=HEADERS,
                timeout=timeout,
            )
            resp.raise_for_status()
            return _parse_html_response(resp.text, search_term)

        except requests.HTTPError as e:
            logger.warning(f'[Chemist Warehouse] HTTP error on attempt {attempt}: {e}')
            if attempt < retries:
                time.sleep(2 ** attempt)
        except Exception as e:
            logger.warning(f'[Chemist Warehouse] Request error on attempt {attempt}: {e}')
            if attempt < retries:
                time.sleep(2 ** attempt)

    logger.error(f'[Chemist Warehouse] Failed to fetch "{search_term}" after {retries} attempts')
    return None


def _parse_html_response(html: str, search_term: str) -> dict | None:
    """Extract price information from Chemist Warehouse search response HTML."""
    try:
        # Regex search for product price and RRP / Save price
        price_match = re.search(r'class="product-price"[^>]*>\s*\$([0-9\.]+)', html, re.IGNORECASE)
        rrp_match = re.search(r'RRP\s*\$([0-9\.]+)', html, re.IGNORECASE)
        save_match = re.search(r'Save\s*\$([0-9\.]+)', html, re.IGNORECASE)
        name_match = re.search(r'class="product-name"[^>]*>([^<]+)<', html, re.IGNORECASE)

        if not price_match:
            # Fallback regex patterns for general search results
            price_match = re.search(r'\$([0-9]+\.[0-9]{2})', html)

        if not price_match:
            logger.warning(f'[Chemist Warehouse] No price found for "{search_term}"')
            return None

        price = float(price_match.group(1))
        rrp = float(rrp_match.group(1)) if rrp_match else price
        save = float(save_match.group(1)) if save_match else 0.0

        if rrp < price and save > 0:
            rrp = price + save

        is_on_sale = save > 0 or rrp > price
        discount_pct = round((1 - price / rrp) * 100) if is_on_sale and rrp > price else None
        name = name_match.group(1).strip() if name_match else search_term

        img_match = re.search(r'class="product-image"[^>]*src="([^"]+)"', html, re.IGNORECASE)
        sku_match = re.search(r'data-productid="([0-9]+)"', html, re.IGNORECASE)

        image_url = img_match.group(1) if img_match else None
        sku = sku_match.group(1) if sku_match else None

        logger.info(
            f'[Chemist Warehouse] "{name}" → ${price:.2f}'
            + (f' (was ${rrp:.2f}, -{discount_pct}%)' if is_on_sale else ' (regular)')
        )

        return {
            'price':         price,
            'regular_price': rrp,
            'on_sale':       is_on_sale,
            'discount_pct':  discount_pct,
            'name':          name,
            'description':   name,
            'image_url':     image_url,
            'sku':           sku,
        }
    except Exception as e:
        logger.error(f'[Chemist Warehouse] Error parsing response for "{search_term}": {e}')
        return None
