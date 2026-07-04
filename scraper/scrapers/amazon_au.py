"""
Amazon AU price scraper.

Scrapes product pages directly using the ASIN (Amazon product ID).
Amazon AU does not require an account to see prices for most grocery items.

To find an ASIN: open the Amazon AU product page and find the 10-character
code in the URL, e.g.: amazon.com.au/dp/B07XXXXXXXX
"""

import re
import time
import logging
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

BASE_URL = 'https://www.amazon.com.au/dp/{asin}'

HEADERS = {
    'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                       '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-AU,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
}


def get_product_price(asin: str, pack_qty: int = 1, timeout: int = 15, retries: int = 3) -> dict | None:
    """
    Fetch the price of an Amazon AU product by ASIN.

    Args:
        asin:      Amazon Standard Identification Number (10-char code)
        pack_qty:  Number of units in the multipack (for per-unit price calc)
        timeout:   HTTP timeout in seconds
        retries:   Number of retry attempts on failure

    Returns a dict with:
        price, regular_price, on_sale, discount_pct, unit_price, name
    or None if the ASIN is None, page not found, or scrape failed.
    """
    if not asin:
        return None  # This product not on Amazon — skip silently

    url = BASE_URL.format(asin=asin)

    for attempt in range(1, retries + 1):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=timeout)
            resp.raise_for_status()
            return _parse_page(resp.text, pack_qty, asin)

        except requests.HTTPError as e:
            code = e.response.status_code
            if code == 404:
                logger.warning(f'[Amazon] ASIN {asin} not found (404)')
                return None
            logger.warning(f'[Amazon] HTTP {code} on attempt {attempt} for {asin}')
            if attempt < retries:
                time.sleep(2 ** attempt)

        except requests.RequestException as e:
            logger.warning(f'[Amazon] Request error on attempt {attempt}: {e}')
            if attempt < retries:
                time.sleep(2 ** attempt)

    logger.error(f'[Amazon] Failed to fetch ASIN {asin} after {retries} attempts')
    return None


def _parse_page(html: str, pack_qty: int, asin: str) -> dict | None:
    """Parse an Amazon product page to extract pricing."""
    soup = BeautifulSoup(html, 'lxml')

    # Amazon uses several price selectors depending on product type
    price = _extract_price_from_selectors(soup, [
        '#priceblock_ourprice',
        '#priceblock_dealprice',
        '.a-price .a-offscreen',
        '#price_inside_buybox',
        '#corePrice_desktop .a-offscreen',
        '.priceToPay .a-offscreen',
    ])

    if price is None:
        # Product may be unavailable or require login
        logger.warning(f'[Amazon] Could not extract price for ASIN {asin}')
        return None

    # Try to find the "was" / list price
    regular_price = _extract_price_from_selectors(soup, [
        '.a-text-price .a-offscreen',
        '#listPrice',
        '.basisPrice .a-offscreen',
    ])

    on_sale = regular_price is not None and regular_price > price * 1.03
    discount_pct = None
    if on_sale and regular_price:
        discount_pct = round((1 - price / regular_price) * 100)

    name = ''
    title_el = soup.find(id='productTitle')
    if title_el:
        name = title_el.get_text(strip=True)

    unit_price = round(price / pack_qty, 2) if pack_qty > 1 else price

    logger.info(
        f'[Amazon] "{name[:50]}" (ASIN: {asin}) → '
        f'${price:.2f} total, ${unit_price:.2f}/unit'
        + (f' (SALE -{discount_pct}%)' if on_sale else '')
    )

    return {
        'price':         price,
        'regular_price': regular_price or price,
        'on_sale':       on_sale,
        'discount_pct':  discount_pct,
        'unit_price':    unit_price,
        'name':          name,
    }


def _extract_price_from_selectors(soup: BeautifulSoup, selectors: list[str]) -> float | None:
    """Try a list of CSS selectors in order and return the first valid price found."""
    for selector in selectors:
        el = soup.select_one(selector)
        if el:
            text = el.get_text(strip=True)
            # Clean price string: "$58.00" → 58.00
            match = re.search(r'[\d,]+\.?\d*', text.replace(',', ''))
            if match:
                try:
                    return float(match.group())
                except ValueError:
                    continue
    return None
